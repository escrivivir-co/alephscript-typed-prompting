import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { insertAIConfigSchema, type InsertAIConfig, type AIConfig } from "@shared/schema";
import { Loader2, Plus, Settings } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { queryClient } from "@/lib/queryClient";

export default function AIConfigPage() {
  const [isOpen, setIsOpen] = useState(false);
  const { toast } = useToast();

  const { data: configs, isLoading } = useQuery({
    queryKey: ["/api/ai-configs"],
  });

  const initMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch("/api/ai-configs/init", {
        method: "POST",
      });
      if (!response.ok) throw new Error("Failed to initialize configs");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/ai-configs"] });
      toast({
        title: "Success",
        description: "Default AI configurations initialized",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to initialize configurations",
        variant: "destructive",
      });
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertAIConfig) => {
      const response = await fetch("/api/ai-configs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) throw new Error("Failed to create config");
      return response.json();
    },
    onSuccess: () => {
      setIsOpen(false);
      queryClient.invalidateQueries({ queryKey: ["/api/ai-configs"] });
      toast({
        title: "Success",
        description: "AI configuration created successfully",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create configuration",
        variant: "destructive",
      });
    },
  });

  const form = useForm<InsertAIConfig>({
    resolver: zodResolver(insertAIConfigSchema),
    defaultValues: {
      name: "",
      provider: "openai",
      apiKey: "",
      baseUrl: "",
      models: [],
      settings: JSON.stringify({
        temperature: 0.7,
        max_tokens: 2000,
      }),
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 lg:p-8 max-w-[1400px] mx-auto w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <h1 className="text-3xl font-bold">AI Configurations</h1>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button
            variant="outline"
            onClick={() => initMutation.mutate()}
            disabled={initMutation.isPending}
            className="w-full sm:w-auto"
          >
            {initMutation.isPending ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Settings className="w-4 h-4 mr-2" />
            )}
            Initialize Default Configs
          </Button>
          <Button onClick={() => setIsOpen(true)} className="w-full sm:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            Add Configuration
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {configs?.map((config: AIConfig) => (
          <Card key={config.id} className="p-4 md:p-6">
            <h3 className="text-xl font-semibold mb-2">{config.name}</h3>
            <p className="text-muted-foreground mb-4">Provider: {config.provider}</p>
            <p className="text-sm break-words">Models: {config.models.join(", ")}</p>
          </Card>
        ))}
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add AI Configuration</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit((data) => createMutation.mutate(data))}
              className="space-y-4"
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Configuration name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="provider"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Provider</FormLabel>
                    <FormControl>
                      <select
                        className="w-full p-2 border rounded"
                        {...field}
                      >
                        <option value="openai">OpenAI</option>
                        <option value="deepseek">DeepSeek</option>
                        <option value="ollama">Ollama</option>
                        <option value="anthropic">Anthropic</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="apiKey"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>API Key</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="baseUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Base URL</FormLabel>
                    <FormControl>
                      <Input placeholder="API base URL" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="submit"
                className="w-full"
                disabled={createMutation.isPending}
              >
                {createMutation.isPending && (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                )}
                Create Configuration
              </Button>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}