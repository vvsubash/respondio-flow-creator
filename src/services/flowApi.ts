import type {
  ConnectorNode,
  CreateNodeInput,
  DateTimeNode,
  FlowNode,
  NodeId,
  UpdateNodeInput,
} from '../../api/flow.types'
import { WEEK_DAYS } from '../../api/flow.types'
import { createNodeId } from '@/utils/id'
import { findNode, nodeKey, removeNode } from '@/utils/graph'
import { StorageSerializers, useStorage } from '@vueuse/core'

export const FLOW_STORAGE_KEY = 'respondio-flow-creator:flow'
export const FLOW_ENDPOINT = '/api/flow'

/** The flow lives in localStorage; the ref is the in-memory copy and keeps tabs in step. */
const stored = useStorage<FlowNode[] | null>(FLOW_STORAGE_KEY, null, undefined, {
  serializer: StorageSerializers.object,
})

function persist(nodes: FlowNode[]): FlowNode[] {
  stored.value = nodes
  return nodes
}

function current(): FlowNode[] {
  return stored.value ?? []
}

export async function fetchFlow(): Promise<FlowNode[]> {
  if (stored.value) return stored.value

  const response = await fetch(FLOW_ENDPOINT)
  if (!response.ok) throw new Error(`Unable to load flow (${response.status})`)
  return persist((await response.json()) as FlowNode[])
}

export async function resetFlow(): Promise<FlowNode[]> {
  stored.value = null
  return fetchFlow()
}

export async function saveFlow(nodes: FlowNode[]): Promise<FlowNode[]> {
  return persist(nodes)
}

function buildNode(input: CreateNodeInput): FlowNode[] {
  const id = createNodeId()
  const base = { id, parentId: input.parentId, name: input.name.trim() }
  const description = input.description.trim()
  const body = description || input.name.trim()

  if (input.type === 'sendMessage') {
    return [
      {
        ...base,
        description,
        type: 'sendMessage',
        data: { payload: [{ type: 'text', text: body }] },
      },
    ]
  }

  if (input.type === 'addComment') {
    return [{ ...base, description, type: 'addComment', data: { comment: body } }]
  }

  const success: ConnectorNode = {
    id: createNodeId(),
    parentId: id,
    name: 'Success',
    type: 'dateTimeConnector',
    data: { connectorType: 'success' },
  }
  const failure: ConnectorNode = {
    id: createNodeId(),
    parentId: id,
    name: 'Failure',
    type: 'dateTimeConnector',
    data: { connectorType: 'failure' },
  }
  const dateTime: DateTimeNode = {
    ...base,
    description,
    type: 'dateTime',
    data: {
      times: WEEK_DAYS.map((day) => ({ day, startTime: '09:00', endTime: '17:00' })),
      connectors: [success.id, failure.id],
      timezone: 'UTC',
      action: 'businessHours',
    },
  }

  return [dateTime, success, failure]
}

export async function createNode(input: CreateNodeInput): Promise<FlowNode[]> {
  return persist([...current(), ...buildNode(input)])
}

export async function updateNode(input: UpdateNodeInput): Promise<FlowNode[]> {
  const nodes = current().map((node) => {
    if (nodeKey(node.id) !== nodeKey(input.id)) return node
    return {
      ...node,
      ...(input.name === undefined ? {} : { name: input.name.trim() }),
      ...(input.description === undefined ? {} : { description: input.description.trim() }),
      ...(input.data === undefined ? {} : { data: input.data }),
    } as FlowNode
  })
  return persist(nodes)
}

export async function deleteNode(id: NodeId): Promise<FlowNode[]> {
  const nodes = current()
  if (!findNode(nodes, id)) return nodes
  return persist(removeNode(nodes, id))
}
