import { ModuleFormData } from "@/types";
import { useFieldArray, useForm } from "react-hook-form";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trash2, Plus } from "lucide-react";

export default function ModulesForm({
  onChange,
}: {
  onChange: (modules: ModuleFormData[]) => void;
}) {
  const [title, setTitle] = useState("");
  const [week, setWeek] = useState(1);
  const [description, setDescription] = useState("");

  const { control, watch } = useForm<{ modules: ModuleFormData[] }>({
    defaultValues: {
      modules: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: "modules",
    control,
  });

  const watchedModules = watch("modules");

  useEffect(() => {
    onChange(watchedModules);
  }, [watchedModules, onChange]);

  const handleAddModule = () => {
    if (title.trim()) {
      append({ title: title.trim(), week, description: description.trim() });
      setTitle("");
      setWeek(fields.length + 2);
      setDescription("");
    }
  };

  return (
    <div className="space-y-6">
      {fields.map((module, index) => (
        <Card key={module.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4 className="text-base font-medium">{module.title}</h4>
                <Badge variant="secondary">Week {module.week}</Badge>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => remove(index)}
                aria-label={`Remove module ${index + 1}`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
            {module.description && (
              <p className="mt-2 text-sm text-muted-foreground">
                {module.description}
              </p>
            )}
          </CardContent>
        </Card>
      ))}
      <Card>
        <CardContent className="p-4">
          <h4 className="text-base font-medium mb-4">Add New Module</h4>
          <div className="grid grid-cols-1 gap-4">
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Module title"
              aria-label="Module title"
            />

            <div className="grid grid-cols-2 gap-4">
              <Input
                type="number"
                min={1}
                value={week}
                onChange={(e) => setWeek(Number(e.target.value))}
                placeholder="Week"
                aria-label="Module week"
              />
              <div></div>
            </div>

            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Short description (optional)"
              className="min-h-[80px]"
              aria-label="Module description"
            />
          </div>
          <Button
            type="button"
            onClick={handleAddModule}
            disabled={!title.trim()}
            className="w-full mt-4"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Module
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
