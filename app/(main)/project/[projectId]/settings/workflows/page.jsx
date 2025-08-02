"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Plus, Trash2, GripVertical } from "lucide-react";
import useFetch from "@/hooks/use-fetch";
import {
  getWorkflows,
  createWorkflow,
  createWorkflowStatus,
  updateWorkflowStatus,
  reorderWorkflowStatuses,
  deleteWorkflowStatus,
} from "@/actions/workflows";
import { BarLoader } from "react-spinners";

export default function WorkflowsSettingsPage() {
  const { projectId } = useParams();
  const [workflows, setWorkflows] = useState([]);
  const [newWorkflowName, setNewWorkflowName] = useState("");
  const [newStatusName, setNewStatusName] = useState("");
  const [selectedWorkflow, setSelectedWorkflow] = useState(null);

  const {
    loading: fetchLoading,
    error: fetchError,
    fn: fetchWorkflows,
    data: fetchedWorkflows,
  } = useFetch(getWorkflows);

  const {
    loading: createWorkflowLoading,
    error: createWorkflowError,
    fn: createWorkflowFn,
    data: newWorkflow,
  } = useFetch(createWorkflow);

  const {
    loading: createStatusLoading,
    error: createStatusError,
    fn: createStatusFn,
    data: newStatus,
  } = useFetch(createWorkflowStatus);

  const {
    loading: updateStatusLoading,
    error: updateStatusError,
    fn: updateStatusFn,
  } = useFetch(updateWorkflowStatus);

  const {
    loading: reorderLoading,
    error: reorderError,
    fn: reorderStatusesFn,
  } = useFetch(reorderWorkflowStatuses);

  const {
    loading: deleteStatusLoading,
    error: deleteStatusError,
    fn: deleteStatusFn,
  } = useFetch(deleteWorkflowStatus);

  useEffect(() => {
    fetchWorkflows(projectId);
  }, [projectId]);

  useEffect(() => {
    if (fetchedWorkflows) {
      setWorkflows(fetchedWorkflows);
      if (fetchedWorkflows.length > 0 && !selectedWorkflow) {
        setSelectedWorkflow(fetchedWorkflows[0].id);
      }
    }
  }, [fetchedWorkflows]);

  useEffect(() => {
    if (newWorkflow) {
      setWorkflows([...workflows, newWorkflow]);
      setSelectedWorkflow(newWorkflow.id);
      setNewWorkflowName("");
    }
  }, [newWorkflow]);

  useEffect(() => {
    if (newStatus) {
      const updatedWorkflows = workflows.map((workflow) => {
        if (workflow.id === selectedWorkflow) {
          return {
            ...workflow,
            statuses: [...workflow.statuses, newStatus],
          };
        }
        return workflow;
      });
      setWorkflows(updatedWorkflows);
      setNewStatusName("");
    }
  }, [newStatus]);

  const handleCreateWorkflow = async (e) => {
    e.preventDefault();
    if (!newWorkflowName.trim()) return;
    await createWorkflowFn(projectId, { name: newWorkflowName });
  };

  const handleCreateStatus = async (e) => {
    e.preventDefault();
    if (!newStatusName.trim() || !selectedWorkflow) return;
    await createStatusFn(selectedWorkflow, { name: newStatusName });
  };

  const handleStatusColorChange = async (statusId, color) => {
    await updateStatusFn(statusId, { color });
  };

  const handleStatusNameChange = async (statusId, name) => {
    await updateStatusFn(statusId, { name });
  };

  const handleDeleteStatus = async (statusId) => {
    try {
      await deleteStatusFn(statusId);
      
      // Update local state
      const updatedWorkflows = workflows.map((workflow) => {
        if (workflow.id === selectedWorkflow) {
          return {
            ...workflow,
            statuses: workflow.statuses.filter((status) => status.id !== statusId),
          };
        }
        return workflow;
      });
      
      setWorkflows(updatedWorkflows);
    } catch (error) {
      console.error("Failed to delete status:", error);
      // You could show an error message here
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const workflowId = selectedWorkflow;
    const workflow = workflows.find((w) => w.id === workflowId);
    const statuses = [...workflow.statuses];
    const [reorderedItem] = statuses.splice(result.source.index, 1);
    statuses.splice(result.destination.index, 0, reorderedItem);

    // Update local state immediately for better UX
    const updatedWorkflows = workflows.map((w) => {
      if (w.id === workflowId) {
        return { ...w, statuses };
      }
      return w;
    });
    setWorkflows(updatedWorkflows);

    // Send the update to the server
    await reorderStatusesFn(workflowId, statuses.map((s) => s.id));
  };

  const selectedWorkflowData = workflows.find((w) => w.id === selectedWorkflow);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Workflow Settings</h1>

      {fetchLoading && <BarLoader width={"100%"} color="#36d7b7" />}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Workflows</CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleCreateWorkflow} className="mb-4">
                <div className="flex gap-2">
                  <Input
                    placeholder="New workflow name"
                    value={newWorkflowName}
                    onChange={(e) => setNewWorkflowName(e.target.value)}
                  />
                  <Button
                    type="submit"
                    disabled={createWorkflowLoading || !newWorkflowName.trim()}
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </form>

              <div className="space-y-2">
                {workflows.map((workflow) => (
                  <div
                    key={workflow.id}
                    className={`p-3 rounded-md cursor-pointer ${
                      selectedWorkflow === workflow.id
                        ? "bg-primary/10 border border-primary/30"
                        : "hover:bg-secondary"
                    }`}
                    onClick={() => setSelectedWorkflow(workflow.id)}
                  >
                    <div className="font-medium">{workflow.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {workflow.statuses.length} statuses
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2">
          {selectedWorkflowData ? (
            <Card>
              <CardHeader>
                <CardTitle>{selectedWorkflowData.name} Statuses</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleCreateStatus} className="mb-6">
                  <div className="flex gap-2">
                    <Input
                      placeholder="New status name"
                      value={newStatusName}
                      onChange={(e) => setNewStatusName(e.target.value)}
                    />
                    <Button
                      type="submit"
                      disabled={createStatusLoading || !newStatusName.trim()}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Add
                    </Button>
                  </div>
                </form>

                <DragDropContext onDragEnd={handleDragEnd}>
                  <Droppable droppableId="statuses">
                    {(provided) => (
                      <div
                        {...provided.droppableProps}
                        ref={provided.innerRef}
                        className="space-y-3"
                      >
                        {selectedWorkflowData.statuses.map((status, index) => (
                          <Draggable
                            key={status.id}
                            draggableId={status.id}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                className="flex items-center gap-3 p-3 bg-card border rounded-md"
                              >
                                <div
                                  {...provided.dragHandleProps}
                                  className="cursor-grab"
                                >
                                  <GripVertical className="h-5 w-5 text-muted-foreground" />
                                </div>
                                <Input
                                  value={status.name}
                                  onChange={(e) =>
                                    handleStatusNameChange(
                                      status.id,
                                      e.target.value
                                    )
                                  }
                                  className="flex-1"
                                />
                                <input
                                  type="color"
                                  value={status.color}
                                  onChange={(e) =>
                                    handleStatusColorChange(
                                      status.id,
                                      e.target.value
                                    )
                                  }
                                  className="h-9 w-12 rounded cursor-pointer"
                                />
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive"
                                  onClick={() => handleDeleteStatus(status.id)}
                                  disabled={deleteStatusLoading}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              </CardContent>
            </Card>
          ) : (
            <div className="flex items-center justify-center h-full">
              <p className="text-muted-foreground">
                Select a workflow or create a new one
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
