import { FaCreditCard, FaUserCheck, FaUsers } from "react-icons/fa";
import { FaMoneyBills } from "react-icons/fa6";
import { useClientList } from "../hooks/useClientList";
import { useMemo } from "react";
import { ClientStatus, ClientStatusLabel } from "../enum/client.enum";
import { useAccountList } from "../hooks/useAccountList";

function Card({
  icon,
  title,
  value,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
}) {
  return (
    <article className="inline-flex flex-col gap-y-2 p-4 rounded-md bg-gray-800 w-full">
      {icon}
      <h3 className="text-sm text-gray-400">{title}</h3>
      <p className="text-xl font-semibold">{value}</p>
    </article>
  );
}

export function DashboardPage() {
  const { data: clients } = useClientList();
  const { data: accounts } = useAccountList();

  const activeClients = useMemo(() => {
    if (!clients) return 0;
    return clients.filter((c) => c.status === ClientStatus.ACTIVE).length;
  }, [clients]);

  const totalBalance = useMemo(() => {
    if (!accounts) return 0;
    return accounts.reduce((p, n) => p + n.balance, 0);
  }, [accounts]);

  return (
    <main>
      <div className="p-5 flex flex-col gap-y-5">
        <section className="flex gap-x-4">
          <Card
            icon={
              <span className="bg-teal-900/50 rounded-md p-2 w-fit">
                <FaUsers className="text-teal-700" size={"1.8rem"} />
              </span>
            }
            title="Clientes totales"
            value={`${clients?.length ?? 0}`}
          />
          <Card
            icon={
              <span className="bg-green-900/50 rounded-md p-2 w-fit">
                <FaUserCheck className="text-green-700" size={"1.8rem"} />
              </span>
            }
            title="Clientes activos"
            value={`${activeClients}`}
          />
          <Card
            icon={
              <span className="bg-yellow-900/50 rounded-md p-2 w-fit">
                <FaCreditCard className="text-yellow-700" size={"1.8rem"} />
              </span>
            }
            title="Cuentas totales"
            value={`${accounts?.length ?? 0}`}
          />
          <Card
            icon={
              <span className="bg-cyan-900/50 rounded-md p-2 w-fit">
                <FaMoneyBills className="text-cyan-700" size={"1.8rem"} />
              </span>
            }
            title="Balance total"
            value={`$ ${totalBalance}`}
          />
        </section>
        <section className="p-4 rounded-md bg-gray-800 w-full">
          <header className="flex justify-between items-center py-3">
            <h3 className="text-xl font-semibold">Clientes recientes</h3>
            <FaUsers className="text-gray-400" size={"1.2rem"} />
          </header>
          {clients?.map((c) => (
            <article
              key={c.id}
              className="border-t border-t-gray-600 py-3 flex items-center gap-x-4"
            >
              <span className="w-8 h-8 text-center content-center rounded-full bg-teal-900/50 text-teal-700">
                {c.name[0].toUpperCase()}
              </span>
              <div className="grow">
                <h4>{c.name}</h4>
                <p className="text-gray-400">
                  <span>DNI: {c.dni}</span> - <span>{c.email}</span>
                </p>
              </div>
              <span
                className={`p-2 rounded-xl text-xs ${c.status === ClientStatus.ACTIVE ? "text-teal-500 bg-teal-900/50" : "text-red-500 bg-red-900/50"}`}
              >
                {ClientStatusLabel[c.status]}
              </span>
            </article>
          ))}
        </section>
      </div>
    </main>
  );
}
