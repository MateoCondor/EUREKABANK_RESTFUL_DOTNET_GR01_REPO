import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FaSearch } from "react-icons/fa";
import z from "zod";

interface Props {
  placeholder?: string;
  onSubmit: (query: string) => Promise<void> | void;
  onReset?: () => Promise<void> | void;
}

const validationSchema = z.object({
  query: z.string(),
});

export function SearchForm({ placeholder = "Buscar...", onSubmit }: Props) {
  const { register, handleSubmit } = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      query: undefined,
    },
  });

  const handleSearch = async (values: z.infer<typeof validationSchema>) => {
    await onSubmit(values.query);
  };

  return (
    <form onSubmit={handleSubmit(handleSearch)}>
      <div className="flex gap-x-3 items-center py-3 px-4 bg-gray-800 rounded-md">
        <FaSearch />
        <input
          className="placeholder:text-gray-500 bg-transparent text-white w-full focus-visible:outline-0"
          type="search"
          id="query"
          placeholder={placeholder}
          {...register("query")}
        />
      </div>
    </form>
  );
}
