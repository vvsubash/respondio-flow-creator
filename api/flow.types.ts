export type NodeId = string | number

export type NodeType = 'trigger' | 'sendMessage' | 'addComment' | 'dateTime' | 'dateTimeConnector'

export const CREATABLE_NODE_TYPES = ['sendMessage', 'addComment', 'dateTime'] as const
export type CreatableNodeType = (typeof CREATABLE_NODE_TYPES)[number]

export const WEEK_DAYS = ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'] as const
export type WeekDay = (typeof WEEK_DAYS)[number]

export interface TextPayload {
  type: 'text'
  text: string
}

export interface AttachmentPayload {
  type: 'attachment'
  attachment: string
  name?: string
}

export type MessagePayload = TextPayload | AttachmentPayload

export interface TriggerData {
  type: string
  oncePerContact: boolean
}

export interface SendMessageData {
  payload: MessagePayload[]
}

export interface AddCommentData {
  comment: string
}

export interface BusinessHours {
  day: WeekDay
  startTime: string
  endTime: string
}

export interface DateTimeData {
  times: BusinessHours[]
  connectors: NodeId[]
  timezone: string
  action: string
}

export interface ConnectorData {
  connectorType: 'success' | 'failure'
}

interface NodeBase<TType extends NodeType, TData> {
  id: NodeId
  parentId: NodeId
  type: TType
  name?: string
  description?: string
  data: TData
}

export type TriggerNode = NodeBase<'trigger', TriggerData>
export type SendMessageNode = NodeBase<'sendMessage', SendMessageData>
export type AddCommentNode = NodeBase<'addComment', AddCommentData>
export type DateTimeNode = NodeBase<'dateTime', DateTimeData>
export type ConnectorNode = NodeBase<'dateTimeConnector', ConnectorData>

export type FlowNode = TriggerNode | SendMessageNode | AddCommentNode | DateTimeNode | ConnectorNode

export interface XYPosition {
  x: number
  y: number
}

export interface CreateNodeInput {
  name: string
  description: string
  type: CreatableNodeType
  parentId: NodeId
}

export interface UpdateNodeInput {
  id: NodeId
  name?: string
  description?: string
  data?: FlowNode['data']
}
