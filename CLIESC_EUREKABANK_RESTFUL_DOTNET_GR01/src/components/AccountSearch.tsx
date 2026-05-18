import { useForm } from "react-hook-form";
import { useAccountList } from "../hooks/useAccountList";
import { Account } from "../dto/account";

interface Props {
  onSubmit?: (data: Account) => Promise<void> | void;
}

export function AccountSearch({ onSubmit }: Props) {
  const { data } = useAccountList();
  const { register, handleSubmit } = useForm({
    defaultValues: {
      accountId: "",
    },
  });

  const handleForm = (values: { accountId: string }) => {
    const account = data?.find((a) => a.id === Number(values.accountId));
    if (!account) return;
    onSubmit?.(account);
  };

  return (
    <form className="flex gap-x-2" onSubmit={handleSubmit(handleForm)}>
      <select className="grow" id="clientId" {...register("accountId")}>
        <option value={""}>Seleccione una cuenta</option>
        {data?.map((c) => (
          <option key={c.id} value={c.id}>
            {c.accountNumber}
          </option>
        ))}
      </select>
      <button className="button w-fit" type="submit">
        Buscar
      </button>
    </form>
  );
}
