import { useMemo, useState } from "react";
import { SearchForm } from "../components/SearchForm";
import { useAccountList } from "../hooks/useAccountList";
import { Account, AccountRequest } from "../dto/account";
import {
  AccountStatus,
  AccountStatusLabel,
  AccountType,
  AccountTypeLabel,
} from "../enum/account.enum";
import { MdCompareArrows, MdOutlineSavings, MdWork } from "react-icons/md";
import { useModal } from "../hooks/useModal";
import { FaPlus } from "react-icons/fa";
import { AccountForm } from "../components/AccountForm";
import { useAccountMutation } from "../hooks/useAccountMutation";
import { useClientList } from "../hooks/useClientList";
import { Client } from "../dto/client";

function AccountCard({
  data,
  client,
  onEdit,
}: {
  data: Account;
  client: Client;
  onEdit: (data: Account) => void;
}) {
  const handleEditClick = () => {
    onEdit(data);
  };

  return (
    <article className="inline-block bg-gray-800 rounded-md p-5">
      <header className="flex justify-between items-center">
        <span className="p-2 rounded-xl text-xs text-cyan-500 bg-cyan-900/50 flex gap-x-1 items-center">
          {data.type === AccountType.CURRENT ? (
            <MdWork />
          ) : (
            <MdOutlineSavings />
          )}
          {AccountTypeLabel[data.type]}
        </span>
        <span
          className={`p-2 rounded-xl text-xs ${data.status === AccountStatus.ACTIVE ? "text-teal-500 bg-teal-900/50" : data.status === AccountStatus.BLOCKED ? "text-yellow-500 bg-yellow-900/50" : "text-red-500 bg-red-900/50"}`}
        >
          {AccountStatusLabel[data.status]}
        </span>
      </header>
      <div className="py-3 border-b border-b-gray-600">
        <h3 className="text-sm text-gray-400">Número de cuenta</h3>
        <p className="text-xl">{data.accountNumber}</p>
      </div>
      <div className="py-3 flex flex-col gap-y-2">
        <div>
          <h4 className="text-sm text-gray-400">Saldo disponible</h4>
          <p className="text-2xl text-teal-700">$ {data.balance}</p>
        </div>
        <div>
          <h4 className="text-sm text-gray-400">Usuario</h4>
          <p>{client.name}</p>
        </div>
      </div>
      <footer className="flex justify-end">
        <button
          type="button"
          className="bg-cyan-900/50 p-2 rounded-md"
          onClick={handleEditClick}
        >
          <MdCompareArrows className="text-cyan-500" />
        </button>
      </footer>
    </article>
  );
}

export function AccountsPage() {
  const [query, setQuery] = useState("");
  const [selectedData, setSelectedData] = useState<{
    id: number;
    dto: AccountRequest;
  } | null>(null);
  const { data } = useAccountList();
  const { data: clients } = useClientList();
  const { error, create, updateStatus } = useAccountMutation();
  const { isOpen, open, close } = useModal();

  const handleEdit = (data: Account) => {
    setSelectedData({
      id: data.id,
      dto: {
        status: data.status,
        clientId: data.clientId,
        type: data.type,
      },
    });
  };

  const handleClose = () => {
    setSelectedData(null);
    close();
  };

  const handleSubmit = async (dto: AccountRequest) => {
    try {
      if (selectedData)
        await updateStatus({
          id: selectedData.id,
          dto: { status: dto.status },
        });
      else await create({ dto });
    } finally {
      setSelectedData(null);
      close();
    }
  };

  const filteredData = useMemo(() => {
    if (!query) return data;

    return data?.filter((c) => c.accountNumber.includes(query));
  }, [data, query]);

  const clientMap = useMemo(() => {
    if (!clients) return null;

    const userMap = new Map();

    clients.forEach((c) => userMap.set(c.id, c));

    return userMap;
  }, [clients]);

  const accounts = useMemo(() => {
    if (!clientMap) return null;

    return filteredData?.map((a) => ({
      account: a,
      client: clientMap.get(a.clientId),
    }));
  }, [filteredData, clientMap]);

  return (
    <main className="h-full">
      <div className="p-5 flex flex-col gap-y-5 relative h-full">
        <SearchForm
          onSubmit={setQuery}
          placeholder="Buscar por número de cuenta"
        />
        <section className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-8">
          {accounts?.map(({ account, client }) => (
            <AccountCard
              key={account.id}
              data={account}
              client={client}
              onEdit={handleEdit}
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
        <AccountForm
          initialData={selectedData?.dto}
          onCancel={handleClose}
          onSubmit={handleSubmit}
          submitError={error}
        />
      </dialog>
    </main>
  );
}
