import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';
import { Clock, AlertTriangle, CheckCircle, User, Calendar } from "lucide-react";

interface CriticalAction {
  id: string;
  title: string;
  description: string;
  priority: 'urgent' | 'high' | 'medium';
  assignee: string;
  deadline: string;
  article: string;
  status: 'todo' | 'inprogress' | 'done';
}

const ActionKanbanBoard = () => {
  const [actions, setActions] = useState<CriticalAction[]>([
    {
      id: '1',
      title: 'Mettre à jour le registre des accidents',
      description: 'Mise à jour obligatoire selon Art. 280 LMRSST',
      priority: 'urgent',
      assignee: 'M. Tremblay',
      deadline: '2024-08-20',
      article: 'Art. 280',
      status: 'todo'
    },
    {
      id: '2',
      title: 'Évaluation des risques chimiques',
      description: 'Compléter avant le 15/08',
      priority: 'urgent',
      assignee: 'Mme Leblanc',
      deadline: '2024-08-15',
      article: 'Art. 51',
      status: 'inprogress'
    },
    {
      id: '3',
      title: 'Formation premiers secours superviseurs',
      description: 'Former 2 superviseurs restants',
      priority: 'high',
      assignee: 'Service RH',
      deadline: '2024-08-25',
      article: 'Art. 123',
      status: 'todo'
    },
    {
      id: '4',
      title: 'Plan d\'évacuation révisé',
      description: 'Suite aux modifications du bâtiment',
      priority: 'medium',
      assignee: 'M. Dubois',
      deadline: '2024-08-30',
      article: 'Art. 90',
      status: 'done'
    }
  ]);

  const handleDragEnd = (result: DropResult) => {
    if (!result.destination) return;

    const newActions = [...actions];
    const actionIndex = newActions.findIndex(action => action.id === result.draggableId);
    
    if (actionIndex !== -1) {
      newActions[actionIndex].status = result.destination.droppableId as CriticalAction['status'];
      setActions(newActions);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'text-destructive';
      case 'high': return 'text-warning';
      case 'medium': return 'text-blue-600';
      default: return 'text-muted-foreground';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'todo': return <Clock className="h-4 w-4 text-muted-foreground" />;
      case 'inprogress': return <AlertTriangle className="h-4 w-4 text-warning" />;
      case 'done': return <CheckCircle className="h-4 w-4 text-success" />;
      default: return <Clock className="h-4 w-4" />;
    }
  };

  const getColumnTitle = (status: string) => {
    switch (status) {
      case 'todo': return 'À faire';
      case 'inprogress': return 'En cours';
      case 'done': return 'Terminé';
      default: return 'Inconnu';
    }
  };

  const filterActionsByStatus = (status: CriticalAction['status']) => 
    actions.filter(action => action.status === status);

  const renderColumn = (status: CriticalAction['status']) => (
    <Droppable droppableId={status} key={status}>
      {(provided, snapshot) => (
        <div 
          ref={provided.innerRef}
          {...provided.droppableProps}
          className={`space-y-3 min-h-[400px] p-4 rounded-lg border-2 border-dashed transition-colors ${
            snapshot.isDraggingOver ? 'border-primary bg-primary/5' : 'border-border bg-muted/20'
          }`}
        >
          <div className="flex items-center gap-2 mb-4">
            {getStatusIcon(status)}
            <h4 className="font-semibold text-foreground">{getColumnTitle(status)}</h4>
            <Badge variant="outline" className="text-xs">
              {filterActionsByStatus(status).length}
            </Badge>
          </div>
          
          {filterActionsByStatus(status).map((action, index) => (
            <Draggable key={action.id} draggableId={action.id} index={index}>
              {(provided, snapshot) => (
                <Card
                  ref={provided.innerRef}
                  {...provided.draggableProps}
                  {...provided.dragHandleProps}
                  className={`cursor-move transition-all ${
                    snapshot.isDragging ? 'rotate-2 shadow-lg' : 'hover:shadow-md'
                  }`}
                >
                  <CardHeader className="pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="text-sm font-medium text-foreground leading-tight">
                        {action.title}
                      </CardTitle>
                      <Badge 
                        variant={action.priority === 'urgent' ? 'destructive' : action.priority === 'high' ? 'secondary' : 'outline'}
                        className="text-xs shrink-0"
                      >
                        {action.priority === 'urgent' ? 'Urgent' : action.priority === 'high' ? 'Élevé' : 'Moyen'}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-xs text-muted-foreground">{action.description}</p>
                    
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        <span>{action.assignee}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{new Date(action.deadline).toLocaleDateString('fr-CA')}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <Badge legalReference={action.article.toLowerCase().replace(/\s+/g, '-').replace('.', '') as any} className="text-xs">
                        {action.article}
                      </Badge>
                      {action.status === 'todo' && (
                        <Button size="sm" variant="outline" className="h-6 text-xs">
                          Démarrer
                        </Button>
                      )}
                      {action.status === 'inprogress' && (
                        <Button size="sm" variant="default" className="h-6 text-xs">
                          Terminer
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
            </Draggable>
          ))}
          {provided.placeholder}
        </div>
      )}
    </Droppable>
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-destructive" />
          Actions critiques (Kanban)
        </CardTitle>
      </CardHeader>
      <CardContent>
        <DragDropContext onDragEnd={handleDragEnd}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {renderColumn('todo')}
            {renderColumn('inprogress')}
            {renderColumn('done')}
          </div>
        </DragDropContext>
      </CardContent>
    </Card>
  );
};

export default ActionKanbanBoard;