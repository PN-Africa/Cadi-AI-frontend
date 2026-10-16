import { useState } from "react";
import { LucideSearch } from "lucide-react";
import searchicon from "../assets/search-normal.svg"

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
}

const SearchBar = ({ placeholder = "Search", onSearch }: SearchBarProps) => {
  const [query, setQuery] = useState("");

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSearch?.(query.trim());
  };

  return (
    <form
      role="search"
      onSubmit={handleSubmit}
      className="flex items-center gap-2 w-full rounded-2xl border border-gray-400 bg-white px-4 py-2 focus-within:border-[#0D469C]"
    >
      <input
        type="text"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full min-w-0 bg-transparent outline-none text-[13px] sm:text-[14px] text-primary placeholder:text-gray-400"
      />
      <button type="submit" aria-label="Search" className="shrink-0 cursor-pointer">
        <img src={searchicon} alt="Search" className="size-4 text-[#6B7C93]" />
      </button>
    </form>
  );
};

export default SearchBar;