import { useMemo, useState } from "react";
import { SearchForm } from "../components/SearchForm";
import { useClientList } from "../hooks/useClientList";
import { Client, ClientRequest } from "../dto/client";
import { ClientStatus, ClientStatusLabel } from "../enum/client.enum";
import {
  FaEdit,
  FaPhone,
  FaPlus,
  FaRegIdCard,
  FaTrash,
  FaUser,
} from "react-icons/fa";
import { MdEmail } from "react-icons/md";
import { useModal } from "../hooks/useModal";
import { ClientForm } from "../components/ClientForm";
import { useClientMutation } from "../hooks/useClientMutation";

function ClientCard({
  data,
  onEdit,
  onDelete,
}: {
  data: Client;
  onEdit?: (data: Client) => Promise<void> | void;
  onDelete?: (id: number) => Promise<void> | void;
}) {
  const handleEditClick = async () => {
    await onEdit?.(data);
  };

  const handleDeleteClick = async () => {
    await onDelete?.(data.id);
  };

  return (
    <article className="inline-block bg-gray-800 rounded-md p-5">
      <header className="flex items-center gap-x-4 pb-4 border-b border-b-gray-400">
        <span className="w-8 h-8 text-center content-center rounded-full bg-teal-900/50 text-teal-700">
          {data.name[0].toUpperCase()}
        </span>
        <h4 className="grow">{data.name}</h4>
        <span
          className={`p-2 rounded-xl text-xs ${data.status === ClientStatus.ACTIVE ? "text-teal-500 bg-teal-900/50" : "text-red-500 bg-red-900/50"}`}
        >
          {ClientStatusLabel[data.status]}
        </span>
      </header>
      <ul className="text-gray-400 text-xs list-none pt-4 flex flex-col gap-y-2">
        <li className="flex gap-x-2 items-center">
          <FaRegIdCard /> <span>DNI: {data.dni}</span>
        </li>
        <li className="flex gap-x-2 items-center">
          <MdEmail /> <span>{data.email}</span>
        </li>
        <li className="flex gap-x-2 items-center">
          <FaPhone /> <span>{data.phone}</span>
        </li>
        <li className="flex gap-x-2 items-center">
          <FaUser /> <span>Usuario: {data.username}</span>
        </li>
      </ul>
      <footer className="flex gap-x-4 justify-end">
        <button
          type="button"
          className="bg-yellow-900/50 p-2 rounded-md"
          onClick={handleEditClick}
        >
          <FaEdit className="text-yellow-500" />
        </button>
        <button
          type="button"
          className="bg-red-900/50 p-2 rounded-md"
          onClick={handleDeleteClick}
        >
          <FaTrash className="text-red-500" />
        </button>
      </footer>
    </article>
  );
}

export function ClientsPage() {
  const [query, setQuery] = useState("");
  const { data } = useClientList();
  const { error, create, update, remove } = useClientMutation();
  const { isOpen, open, close } = useModal();
  const [selectedData, setSelectedData] = useState<{
    id: number;
    dto: ClientRequest;
  } | null>(null);

  const handleEdit = (data: Client) => {
    setSelectedData({
      id: data.id,
      dto: {
        dni: data.dni,
        email: data.email,
        name: data.name,
        phone: data.phone,
        status: data.status,
        username: data.username,
        password: null,
      },
    });
    open();
  };

  const handleCancel = () => {
    setSelectedData(null);
    close();
  };

  const handleSubmit = async (dto: ClientRequest) => {
    try {
      if (selectedData) await update({ id: selectedData.id, dto });
      else await create({ dto });
    } finally {
      setSelectedData(null);
      close();
    }
  };

  const handleDelete = (id: number) => {
    remove({ id });
  };

  const filteredData = useMemo(() => {
    if (!query) return data;

    return data?.filter(
      (c) =>
        c.name.includes(query) ||
        c.dni.includes(query) ||
        c.email.includes(query),
    );
  }, [data, query]);

  return (
    <main className="h-full">
      <div className="p-5 flex flex-col gap-y-5 relative h-full">
        <SearchForm
          onSubmit={setQuery}
          placeholder="Buscar por nombre, DNI o email..."
        />
        <section className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-8">
          {filteredData?.map((c) => (
            <ClientCard
              key={c.id}
              data={c}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </section>
        <button
          className="bg-teal-700 w-12 h-12 inline-block rounded-full absolute right-5 bottom-5"
          onClick={open}
        >
          <FaPlus className="text-white mx-auto" />
        </button>
      </div>

      <dialog className="modal" open={isOpen || !!selectedData}>
        <ClientForm
          submitError={error}
          initialData={selectedData?.dto}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
        />
      </dialog>
    </main>
  );
}
