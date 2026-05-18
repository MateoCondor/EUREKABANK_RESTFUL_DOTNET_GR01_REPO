import { TiArrowDownThick, TiArrowUpThick } from "react-icons/ti";
import { AccountSearch } from "../components/AccountSearch";
import { Account } from "../dto/account";
import {
  TransactionType,
  TransactionTypeLabel,
} from "../enum/transaciton.enum";
import { useTransaction } from "../hooks/useTransaction";
import { MdCompareArrows } from "react-icons/md";
import {
  DepositRequest,
  Transaction,
  TransferRequest,
  WithdrawRequest,
} from "../dto/transaction";
import { FaSearch } from "react-icons/fa";
import { RxCross2 } from "react-icons/rx";
import { useState } from "react";
import { useModal } from "../hooks/useModal";
import { DepositForm } from "../components/DepositForm";
import { WithdrawForm } from "../components/WithdrawForm";
import { TransferForm } from "../components/TransferForm";
import { useTransactionMutation } from "../hooks/useTransactionMutation";

function TransactionCard({ data }: { data: Transaction }) {
  return (
    <article className="flex p-4 rounded-md bg-gray-800 items-center gap-x-4">
      <span
        className={`w-8 h-8 rounded-full content-center ${
          data.type === TransactionType.DEPOSIT
            ? "text-green-500 bg-green-900/50"
            : data.type === TransactionType.WITHDRAW
              ? "text-red-500 bg-red-900/50"
              : "text-yellow-500 bg-yellow-900/50"
        }`}
      >
        {data.type === TransactionType.DEPOSIT ? (
          <TiArrowDownThick className="mx-auto" />
        ) : data.type === TransactionType.WITHDRAW ? (
          <TiArrowUpThick className="mx-auto" />
        ) : (
          <MdCompareArrows className="mx-auto" />
        )}
      </span>
      <header className="grow">
        <h3>{TransactionTypeLabel[data.type]}</h3>
        <time className="text-gray-400 text-xs" dateTime={data.date}>
          {new Date(data.date).toLocaleDateString()} -
          {new Date(data.date).toLocaleTimeString()}
        </time>
      </header>
      <footer>
        <p
          className={`text-lg font-semibold ${
            data.type === TransactionType.DEPOSIT
              ? "text-green-500"
              : data.type === TransactionType.WITHDRAW
                ? "text-red-500"
                : "text-yellow-500"
          }`}
        >
          {data.type === TransactionType.DEPOSIT
            ? "+ "
            : data.type === TransactionType.WITHDRAW
              ? "- "
              : "~ "}
          ${data.amount}
        </p>
      </footer>
    </article>
  );
}

export function TransactionsPage() {
  const [transaction, setTransaction] = useState<TransactionType | null>(null);
  const { data, findByAccount } = useTransaction();
  const { isOpen, open, close } = useModal();
  const { error, deposit, transfer, withdraw } = useTransactionMutation();

  const handleSearch = async (account: Account) => {
    await findByAccount(account.id);
  };

  const selectTransaction = (type: TransactionType) => {
    return () => {
      setTransaction(type);
      open();
    };
  };

  const handleTransaction = async (
    transactionCallback: () => Promise<{ accountId: number }>,
  ) => {
    try {
      const { accountId } = await transactionCallback();
      findByAccount(accountId);
    } finally {
      setTransaction(null);
      close();
    }
  };

  const handleDeposit = async (dto: DepositRequest) => {
    try {
      await deposit({ dto });
      return { accountId: dto.accountId };
    } finally {
      setTransaction(null);
      close();
    }
  };

  const handleWithdraw = async (dto: WithdrawRequest) => {
    await withdraw({ dto });
    return { accountId: dto.accountId };
  };

  const handleTransfer = async (dto: TransferRequest) => {
    await transfer({ dto });
    return { accountId: dto.sourceAccountId };
  };

  const handleCancel = () => {
    setTransaction(null);
    close();
  };

  return (
    <main className="h-full">
      <div className="p-5 flex flex-col gap-y-5 relative h-full">
        <article className="flex gap-x-2">
          <button
            type="button"
            className="bg-green-500 text-white px-2 py-1 rounded-md flex gap-x-1 items-center"
            onClick={selectTransaction(TransactionType.DEPOSIT)}
          >
            <TiArrowDownThick className="mx-auto" />
            Depositar
          </button>
          <button
            type="button"
            className="bg-red-500 text-white px-2 py-1 rounded-md flex gap-x-1 items-center"
            onClick={selectTransaction(TransactionType.WITHDRAW)}
          >
            <TiArrowUpThick className="mx-auto" />
            Retirar
          </button>
          <button
            type="button"
            className="bg-yellow-500 text-white px-2 py-1 rounded-md flex gap-x-1 items-center"
            onClick={selectTransaction(TransactionType.TRANSFER)}
          >
            <MdCompareArrows className="mx-auto" />
            Transferir
          </button>
        </article>
        <AccountSearch onSubmit={handleSearch} />
        <section>
          <h2 className="font-semibold text-lg py-4">
            Historial de transacciones
          </h2>
          <ul>
            {!data ? (
              <li>
                <p className="text-gray-500 flex flex-col gap-y-2 items-center">
                  <FaSearch size={"2rem"} />
                  Seleccione una cuenta para ver el historial de transacciones
                </p>
              </li>
            ) : !data.length ? (
              <li>
                <p className="text-gray-500 flex flex-col gap-y-2 items-center">
                  <RxCross2 size={"2rem"} />
                  No hay transacciones realizadas en esta cuenta
                </p>
              </li>
            ) : (
              data.map((t) => (
                <li key={t.id}>
                  <TransactionCard data={t} />
                </li>
              ))
            )}
          </ul>
        </section>
      </div>

      <dialog className="modal" open={isOpen}>
        {transaction === TransactionType.DEPOSIT ? (
          <DepositForm
            onCancel={handleCancel}
            onSubmit={(dto) => handleTransaction(() => handleDeposit(dto))}
            submitError={error}
          />
        ) : transaction === TransactionType.WITHDRAW ? (
          <WithdrawForm
            onCancel={handleCancel}
            onSubmit={(dto) => handleTransaction(() => handleWithdraw(dto))}
            submitError={error}
          />
        ) : (
          <TransferForm
            onCancel={handleCancel}
            onSubmit={(dto) => handleTransaction(() => handleTransfer(dto))}
            submitError={error}
          />
        )}
      </dialog>
    </main>
  );
}
