import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (e: React.FormEvent) => void;
}

export function SearchBar({
  searchTerm,
  onSearchChange,
  onSearchSubmit,
}: SearchBarProps) {
  const t = useTranslations("events");
  return (
    <section className="container pb-12">
      <form
        onSubmit={onSearchSubmit}
        className="mx-auto flex max-w-3xl items-center"
      >
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="search"
            placeholder={t("searchPlaceholder")}
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="h-14 w-full rounded-full border pl-10 focus-visible:ring-0"
          />
        </div>
        <Button
          type="submit"
          size="icon"
          className="h-14 w-14 flex-shrink-0 rounded-full ml-2"
        >
          <ArrowRight className="h-5 w-5" />
        </Button>
      </form>
    </section>
  );
}