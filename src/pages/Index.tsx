import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import Icon from '@/components/ui/icon';
import { toast } from '@/hooks/use-toast';

const SPHERES_API = 'https://functions.poehali.dev/cdb11f8d-68eb-4d5a-98e6-cae272c2ce8a';
const CHECKLISTS_API = 'https://functions.poehali.dev/5344e70a-e276-4797-989b-892605075f62';
const TASKS_API = 'https://functions.poehali.dev/12f05b6e-0be8-4ff3-a38f-9e798cbffa5b';

interface LifeSphere {
  id: number;
  name: string;
  icon: string;
  color: string;
  created_at: string;
}

interface Checklist {
  id: number;
  title: string;
  description: string;
  sphere_id: number;
  sphere_name?: string;
  sphere_color?: string;
  sphere_icon?: string;
  tasks_count?: number;
  tasks?: Task[];
  created_at: string;
}

interface Task {
  id: number;
  title: string;
  description: string;
  checklist_id: number;
  sphere_id: number;
  is_completed: boolean;
  priority: string;
  created_at: string;
}

const iconOptions = ['Home', 'Briefcase', 'Heart', 'Star', 'Zap', 'Coffee', 'Book', 'Music', 'Dumbbell', 'Paintbrush'];
const colorOptions = ['#F97316', '#8B5CF6', '#D946EF', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#06B6D4'];

export default function Index() {
  const [activeTab, setActiveTab] = useState('spheres');
  const [editingSphere, setEditingSphere] = useState<LifeSphere | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', icon: 'Circle', color: '#8B5CF6' });
  
  const [editingChecklist, setEditingChecklist] = useState<Checklist | null>(null);
  const [isChecklistDialogOpen, setIsChecklistDialogOpen] = useState(false);
  const [checklistFormData, setChecklistFormData] = useState({ title: '', description: '', sphere_id: 0 });
  
  const [viewingChecklist, setViewingChecklist] = useState<Checklist | null>(null);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const [taskFormData, setTaskFormData] = useState({ title: '', description: '', priority: 'medium' });
  
  const queryClient = useQueryClient();

  const { data: spheres = [], isLoading } = useQuery<LifeSphere[]>({
    queryKey: ['spheres'],
    queryFn: async () => {
      const res = await fetch(SPHERES_API);
      return res.json();
    }
  });

  const { data: checklists = [], isLoading: checklistsLoading } = useQuery<Checklist[]>({
    queryKey: ['checklists'],
    queryFn: async () => {
      const res = await fetch(CHECKLISTS_API);
      return res.json();
    }
  });

  const createMutation = useMutation({
    mutationFn: async (data: { name: string; icon: string; color: string }) => {
      const res = await fetch(SPHERES_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spheres'] });
      toast({ title: 'Сфера создана!' });
      setIsDialogOpen(false);
      setFormData({ name: '', icon: 'Circle', color: '#8B5CF6' });
    }
  });

  const updateMutation = useMutation({
    mutationFn: async (data: LifeSphere) => {
      const res = await fetch(SPHERES_API, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spheres'] });
      toast({ title: 'Сфера обновлена!' });
      setIsDialogOpen(false);
      setEditingSphere(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${SPHERES_API}?id=${id}`, { method: 'DELETE' });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['spheres'] });
      toast({ title: 'Сфера удалена!' });
    }
  });

  const createChecklistMutation = useMutation({
    mutationFn: async (data: { title: string; description: string; sphere_id: number }) => {
      const res = await fetch(CHECKLISTS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
      toast({ title: 'Чек-лист создан!' });
      setIsChecklistDialogOpen(false);
      setChecklistFormData({ title: '', description: '', sphere_id: 0 });
    }
  });

  const updateChecklistMutation = useMutation({
    mutationFn: async (data: Partial<Checklist> & { id: number }) => {
      const res = await fetch(CHECKLISTS_API, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
      toast({ title: 'Чек-лист обновлен!' });
      setIsChecklistDialogOpen(false);
      setEditingChecklist(null);
    }
  });

  const deleteChecklistMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${CHECKLISTS_API}?id=${id}`, { method: 'DELETE' });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
      toast({ title: 'Чек-лист удален!' });
      setViewingChecklist(null);
    }
  });

  const createTaskMutation = useMutation({
    mutationFn: async (data: { title: string; description: string; checklist_id: number; sphere_id: number; priority: string }) => {
      const res = await fetch(TASKS_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
      toast({ title: 'Задача добавлена!' });
      setIsTaskDialogOpen(false);
      setTaskFormData({ title: '', description: '', priority: 'medium' });
      if (viewingChecklist) {
        fetchChecklistDetails(viewingChecklist.id);
      }
    }
  });

  const updateTaskMutation = useMutation({
    mutationFn: async (data: Partial<Task> & { id: number }) => {
      const res = await fetch(TASKS_API, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
      if (viewingChecklist) {
        fetchChecklistDetails(viewingChecklist.id);
      }
    }
  });

  const deleteTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await fetch(`${TASKS_API}?id=${id}`, { method: 'DELETE' });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['checklists'] });
      toast({ title: 'Задача удалена!' });
      if (viewingChecklist) {
        fetchChecklistDetails(viewingChecklist.id);
      }
    }
  });

  const fetchChecklistDetails = async (id: number) => {
    const res = await fetch(`${CHECKLISTS_API}?id=${id}`);
    const data = await res.json();
    setViewingChecklist(data);
  };

  const handleSubmit = () => {
    if (editingSphere) {
      updateMutation.mutate({ ...editingSphere, ...formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleChecklistSubmit = () => {
    if (editingChecklist) {
      updateChecklistMutation.mutate({ ...editingChecklist, ...checklistFormData });
    } else {
      createChecklistMutation.mutate(checklistFormData);
    }
  };

  const handleTaskSubmit = () => {
    if (viewingChecklist) {
      createTaskMutation.mutate({
        ...taskFormData,
        checklist_id: viewingChecklist.id,
        sphere_id: viewingChecklist.sphere_id
      });
    }
  };

  const openEditDialog = (sphere: LifeSphere) => {
    setEditingSphere(sphere);
    setFormData({ name: sphere.name, icon: sphere.icon, color: sphere.color });
    setIsDialogOpen(true);
  };

  const openCreateDialog = () => {
    setEditingSphere(null);
    setFormData({ name: '', icon: 'Circle', color: '#8B5CF6' });
    setIsDialogOpen(true);
  };

  const openChecklistDialog = (checklist?: Checklist) => {
    if (checklist) {
      setEditingChecklist(checklist);
      setChecklistFormData({ 
        title: checklist.title, 
        description: checklist.description, 
        sphere_id: checklist.sphere_id 
      });
    } else {
      setEditingChecklist(null);
      setChecklistFormData({ title: '', description: '', sphere_id: spheres[0]?.id || 0 });
    }
    setIsChecklistDialogOpen(true);
  };

  const toggleTaskCompletion = (task: Task) => {
    updateTaskMutation.mutate({
      id: task.id,
      title: task.title,
      description: task.description,
      is_completed: !task.is_completed,
      priority: task.priority
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
      <div className="container mx-auto p-6 max-w-6xl">
        <header className="mb-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 bg-clip-text text-transparent mb-2">
            Мои дела
          </h1>
          <p className="text-muted-foreground text-lg">Управляй своей жизнью эффективно</p>
        </header>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-white/70 backdrop-blur-sm p-1">
            <TabsTrigger value="spheres" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-pink-500 data-[state=active]:text-white">
              <Icon name="Target" size={18} className="mr-2" />
              Сферы
            </TabsTrigger>
            <TabsTrigger value="checklists" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-orange-500 data-[state=active]:text-white">
              <Icon name="ListChecks" size={18} className="mr-2" />
              Чек-листы
            </TabsTrigger>
            <TabsTrigger value="tasks" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-purple-500 data-[state=active]:text-white">
              <Icon name="CheckSquare" size={18} className="mr-2" />
              Задачи
            </TabsTrigger>
          </TabsList>

          <TabsContent value="spheres" className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-semibold">Сферы жизни</h2>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={openCreateDialog} className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600">
                    <Icon name="Plus" size={18} className="mr-2" />
                    Добавить сферу
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>{editingSphere ? 'Редактировать сферу' : 'Новая сфера'}</DialogTitle>
                    <DialogDescription>
                      Создайте категорию для организации ваших задач
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Название</Label>
                      <Input 
                        id="name" 
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="Например: Здоровье"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Иконка</Label>
                      <div className="grid grid-cols-5 gap-2">
                        {iconOptions.map((icon) => (
                          <Button
                            key={icon}
                            type="button"
                            variant={formData.icon === icon ? 'default' : 'outline'}
                            className="h-12 w-full"
                            onClick={() => setFormData({ ...formData, icon })}
                          >
                            <Icon name={icon} size={20} />
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>Цвет</Label>
                      <div className="grid grid-cols-4 gap-2">
                        {colorOptions.map((color) => (
                          <Button
                            key={color}
                            type="button"
                            variant="outline"
                            className="h-12 w-full relative"
                            style={{ backgroundColor: formData.color === color ? color : 'transparent' }}
                            onClick={() => setFormData({ ...formData, color })}
                          >
                            <div 
                              className="w-8 h-8 rounded-full border-2 border-white shadow-sm" 
                              style={{ backgroundColor: color }}
                            />
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                      Отмена
                    </Button>
                    <Button onClick={handleSubmit} disabled={!formData.name}>
                      {editingSphere ? 'Сохранить' : 'Создать'}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>

            {isLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="animate-pulse">
                    <CardHeader className="h-32 bg-muted" />
                  </Card>
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {spheres.map((sphere) => (
                  <Card 
                    key={sphere.id} 
                    className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 overflow-hidden group"
                    style={{ borderColor: sphere.color + '40' }}
                  >
                    <div 
                      className="h-2 w-full" 
                      style={{ background: `linear-gradient(90deg, ${sphere.color}, ${sphere.color}dd)` }}
                    />
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div 
                            className="p-3 rounded-2xl"
                            style={{ backgroundColor: sphere.color + '20' }}
                          >
                            <Icon name={sphere.icon} size={28} style={{ color: sphere.color }} />
                          </div>
                          <div>
                            <CardTitle className="text-xl">{sphere.name}</CardTitle>
                            <CardDescription>0 задач</CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="flex gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 hover:bg-primary hover:text-white transition-colors"
                          onClick={() => openEditDialog(sphere)}
                        >
                          <Icon name="Pencil" size={16} className="mr-1" />
                          Изменить
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="flex-1 hover:bg-destructive hover:text-white transition-colors"
                          onClick={() => {
                            if (confirm('Удалить эту сферу?')) {
                              deleteMutation.mutate(sphere.id);
                            }
                          }}
                        >
                          <Icon name="Trash2" size={16} className="mr-1" />
                          Удалить
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="checklists">
            {viewingChecklist ? (
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setViewingChecklist(null)}
                  >
                    <Icon name="ArrowLeft" size={18} className="mr-2" />
                    Назад
                  </Button>
                  <div className="flex-1">
                    <h2 className="text-2xl font-semibold flex items-center gap-3">
                      {viewingChecklist.sphere_icon && (
                        <div 
                          className="p-2 rounded-xl"
                          style={{ backgroundColor: viewingChecklist.sphere_color + '20' }}
                        >
                          <Icon 
                            name={viewingChecklist.sphere_icon} 
                            size={24} 
                            style={{ color: viewingChecklist.sphere_color }} 
                          />
                        </div>
                      )}
                      {viewingChecklist.title}
                    </h2>
                    <p className="text-muted-foreground">{viewingChecklist.description}</p>
                  </div>
                  <Button 
                    variant="outline"
                    onClick={() => openChecklistDialog(viewingChecklist)}
                  >
                    <Icon name="Pencil" size={16} className="mr-2" />
                    Редактировать
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => {
                      if (confirm('Удалить этот чек-лист?')) {
                        deleteChecklistMutation.mutate(viewingChecklist.id);
                      }
                    }}
                  >
                    <Icon name="Trash2" size={16} className="mr-2" />
                    Удалить
                  </Button>
                </div>

                <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-pink-500 to-orange-500">
                      <Icon name="Plus" size={18} className="mr-2" />
                      Добавить задачу
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Новая задача</DialogTitle>
                      <DialogDescription>
                        Добавьте задачу в чек-лист
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <Label htmlFor="task-title">Название</Label>
                        <Input 
                          id="task-title" 
                          value={taskFormData.title}
                          onChange={(e) => setTaskFormData({ ...taskFormData, title: e.target.value })}
                          placeholder="Название задачи"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="task-description">Описание</Label>
                        <Textarea 
                          id="task-description" 
                          value={taskFormData.description}
                          onChange={(e) => setTaskFormData({ ...taskFormData, description: e.target.value })}
                          placeholder="Описание задачи"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="task-priority">Приоритет</Label>
                        <Select 
                          value={taskFormData.priority}
                          onValueChange={(value) => setTaskFormData({ ...taskFormData, priority: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Низкий</SelectItem>
                            <SelectItem value="medium">Средний</SelectItem>
                            <SelectItem value="high">Высокий</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setIsTaskDialogOpen(false)}>
                        Отмена
                      </Button>
                      <Button onClick={handleTaskSubmit} disabled={!taskFormData.title}>
                        Добавить
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <div className="space-y-3">
                  {viewingChecklist.tasks && viewingChecklist.tasks.length > 0 ? (
                    viewingChecklist.tasks.map((task) => (
                      <Card key={task.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <Checkbox 
                              checked={task.is_completed}
                              onCheckedChange={() => toggleTaskCompletion(task)}
                              className="mt-1"
                            />
                            <div className="flex-1">
                              <h4 className={`font-medium ${task.is_completed ? 'line-through text-muted-foreground' : ''}`}>
                                {task.title}
                              </h4>
                              {task.description && (
                                <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                              )}
                              <div className="flex items-center gap-2 mt-2">
                                <span className={`text-xs px-2 py-1 rounded-full ${
                                  task.priority === 'high' ? 'bg-red-100 text-red-700' :
                                  task.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                                  'bg-green-100 text-green-700'
                                }`}>
                                  {task.priority === 'high' ? 'Высокий' : task.priority === 'medium' ? 'Средний' : 'Низкий'}
                                </span>
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => {
                                if (confirm('Удалить эту задачу?')) {
                                  deleteTaskMutation.mutate(task.id);
                                }
                              }}
                            >
                              <Icon name="Trash2" size={16} />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  ) : (
                    <Card className="border-2 border-dashed">
                      <CardContent className="p-8 text-center text-muted-foreground">
                        <Icon name="ListTodo" size={48} className="mx-auto mb-2 opacity-50" />
                        <p>Нет задач в этом чек-листе</p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-2xl font-semibold">Чек-листы</h2>
                  <Dialog open={isChecklistDialogOpen} onOpenChange={setIsChecklistDialogOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        onClick={() => openChecklistDialog()}
                        className="bg-gradient-to-r from-pink-500 to-orange-500 hover:from-pink-600 hover:to-orange-600"
                      >
                        <Icon name="Plus" size={18} className="mr-2" />
                        Создать чек-лист
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[500px]">
                      <DialogHeader>
                        <DialogTitle>{editingChecklist ? 'Редактировать чек-лист' : 'Новый чек-лист'}</DialogTitle>
                        <DialogDescription>
                          Создайте чек-лист для организации задач
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="checklist-title">Название</Label>
                          <Input 
                            id="checklist-title" 
                            value={checklistFormData.title}
                            onChange={(e) => setChecklistFormData({ ...checklistFormData, title: e.target.value })}
                            placeholder="Например: Утренняя рутина"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="checklist-description">Описание</Label>
                          <Textarea 
                            id="checklist-description" 
                            value={checklistFormData.description}
                            onChange={(e) => setChecklistFormData({ ...checklistFormData, description: e.target.value })}
                            placeholder="Краткое описание чек-листа"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="checklist-sphere">Сфера</Label>
                          <Select 
                            value={checklistFormData.sphere_id.toString()}
                            onValueChange={(value) => setChecklistFormData({ ...checklistFormData, sphere_id: parseInt(value) })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Выберите сферу" />
                            </SelectTrigger>
                            <SelectContent>
                              {spheres.map((sphere) => (
                                <SelectItem key={sphere.id} value={sphere.id.toString()}>
                                  <div className="flex items-center gap-2">
                                    <Icon name={sphere.icon} size={16} style={{ color: sphere.color }} />
                                    {sphere.name}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      <DialogFooter>
                        <Button variant="outline" onClick={() => setIsChecklistDialogOpen(false)}>
                          Отмена
                        </Button>
                        <Button onClick={handleChecklistSubmit} disabled={!checklistFormData.title || !checklistFormData.sphere_id}>
                          {editingChecklist ? 'Сохранить' : 'Создать'}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>

                {checklistsLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <Card key={i} className="animate-pulse">
                        <CardHeader className="h-32 bg-muted" />
                      </Card>
                    ))}
                  </div>
                ) : checklists.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {checklists.map((checklist) => (
                      <Card 
                        key={checklist.id}
                        className="hover:shadow-xl transition-all duration-300 hover:-translate-y-1 border-2 overflow-hidden cursor-pointer"
                        style={{ borderColor: checklist.sphere_color + '40' }}
                        onClick={() => fetchChecklistDetails(checklist.id)}
                      >
                        <div 
                          className="h-2 w-full" 
                          style={{ background: `linear-gradient(90deg, ${checklist.sphere_color}, ${checklist.sphere_color}dd)` }}
                        />
                        <CardHeader>
                          <div className="flex items-start gap-3">
                            <div 
                              className="p-3 rounded-2xl"
                              style={{ backgroundColor: checklist.sphere_color + '20' }}
                            >
                              <Icon 
                                name={checklist.sphere_icon || 'ListChecks'} 
                                size={24} 
                                style={{ color: checklist.sphere_color }} 
                              />
                            </div>
                            <div className="flex-1">
                              <CardTitle className="text-lg">{checklist.title}</CardTitle>
                              <CardDescription>{checklist.sphere_name}</CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">
                              {checklist.tasks_count || 0} {checklist.tasks_count === 1 ? 'задача' : 'задач'}
                            </span>
                            <Icon name="ChevronRight" size={20} className="text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="border-2 border-dashed">
                    <CardContent className="p-12 text-center">
                      <Icon name="ListChecks" size={64} className="mx-auto mb-4 opacity-50" />
                      <h3 className="text-xl font-semibold mb-2">Нет чек-листов</h3>
                      <p className="text-muted-foreground mb-4">Создайте первый чек-лист для организации задач</p>
                      <Button onClick={() => openChecklistDialog()}>
                        Создать чек-лист
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="tasks">
            <Card className="border-2 border-dashed">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="CheckSquare" size={24} />
                  Задачи
                </CardTitle>
                <CardDescription>Здесь будут все ваши задачи по сферам</CardDescription>
              </CardHeader>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
