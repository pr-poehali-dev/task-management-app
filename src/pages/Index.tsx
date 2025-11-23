import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { toast } from '@/hooks/use-toast';

const SPHERES_API = 'https://functions.poehali.dev/cdb11f8d-68eb-4d5a-98e6-cae272c2ce8a';

interface LifeSphere {
  id: number;
  name: string;
  icon: string;
  color: string;
  created_at: string;
}

const iconOptions = ['Home', 'Briefcase', 'Heart', 'Star', 'Zap', 'Coffee', 'Book', 'Music', 'Dumbbell', 'Paintbrush'];
const colorOptions = ['#F97316', '#8B5CF6', '#D946EF', '#0EA5E9', '#10B981', '#F59E0B', '#EF4444', '#06B6D4'];

export default function Index() {
  const [activeTab, setActiveTab] = useState('spheres');
  const [editingSphere, setEditingSphere] = useState<LifeSphere | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', icon: 'Circle', color: '#8B5CF6' });
  
  const queryClient = useQueryClient();

  const { data: spheres = [], isLoading } = useQuery<LifeSphere[]>({
    queryKey: ['spheres'],
    queryFn: async () => {
      const res = await fetch(SPHERES_API);
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

  const handleSubmit = () => {
    if (editingSphere) {
      updateMutation.mutate({ ...editingSphere, ...formData });
    } else {
      createMutation.mutate(formData);
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
            <Card className="border-2 border-dashed">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Icon name="ListChecks" size={24} />
                  Чек-листы
                </CardTitle>
                <CardDescription>Скоро здесь появятся чек-листы для повторяющихся дел</CardDescription>
              </CardHeader>
            </Card>
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
