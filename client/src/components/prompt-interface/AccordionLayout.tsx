import { ReactNode } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface AccordionSection {
  id: string;
  title: string;
  content: ReactNode;
}

interface AccordionLayoutProps {
  sections: AccordionSection[];
  defaultValues?: string[];
}

export function AccordionLayout({ sections, defaultValues }: AccordionLayoutProps) {
  return (
    <Accordion
      type="multiple"
      defaultValue={defaultValues}
      className="space-y-6"
    >
      {sections.map((section) => (
        <AccordionItem key={section.id} value={section.id} className="border rounded-lg">
          <AccordionTrigger className="px-6">{section.title}</AccordionTrigger>
          <AccordionContent>{section.content}</AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
