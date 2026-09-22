import { useMutation, useQuery, useQueryClient } from '@tanstack/vue-query'
import type { FlowNode } from '../../api/flow.types'
import {
  createNode,
  deleteNode,
  fetchFlow,
  resetFlow,
  saveFlow,
  updateNode,
} from '@/services/flowApi'

export const flowKeys = {
  all: ['flow'] as const,
}

export function useFlowQuery() {
  return useQuery({ queryKey: flowKeys.all, queryFn: fetchFlow })
}

export function useFlowMutations() {
  const queryClient = useQueryClient()
  const onSuccess = (nodes: FlowNode[]) => {
    queryClient.setQueryData(flowKeys.all, nodes)
  }

  return {
    create: useMutation({ mutationFn: createNode, onSuccess }),
    update: useMutation({ mutationFn: updateNode, onSuccess }),
    remove: useMutation({ mutationFn: deleteNode, onSuccess }),
    replace: useMutation({ mutationFn: saveFlow, onSuccess }),
    reset: useMutation({ mutationFn: resetFlow, onSuccess }),
  }
}
