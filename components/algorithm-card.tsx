"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { DivideIcon as LucideIcon } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

interface AlgorithmCardProps {
  title: string;
  description: string;
  icon: typeof LucideIcon;
  href: string;
  complexity: string;
  category: string;
}

export function AlgorithmCard({ title, description, icon: Icon, href, complexity, category }: AlgorithmCardProps) {
  return (
    <Link href={href}>
      <Card className="algorithm-card h-full cursor-pointer group">
        <CardHeader>
          <div className="flex items-center gap-2 mb-2">
            <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Icon className="h-6 w-6 text-primary" />
            </div>
            <CardTitle className="text-xl">{title}</CardTitle>
          </div>
          <div className="flex gap-2 mb-3">
            <Badge variant="secondary">{category}</Badge>
            <Badge variant="outline" className="text-primary">
              {complexity}
            </Badge>
          </div>
          <CardDescription className="text-sm">
            {description}
          </CardDescription>
        </CardHeader>
      </Card>
    </Link>
  );
}