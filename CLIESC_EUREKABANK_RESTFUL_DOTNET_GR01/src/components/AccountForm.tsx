import { useForm } from "react-hook-form";
import { AccountRequest } from "../dto/account";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import {
  AccountStatus,
  AccountStatusLabel,
  AccountType,
  AccountTypeLabel,
} from "../enum/account.enum";
import { ImSpinner8 } from "react-icons/im";
import { useClientList } from "../hooks/useClientList";

interface Props {
  initialData?: AccountRequest | null;
  submitError?: Error | null;
  onSubmit?: (dto: AccountRequest) => Promise<void> | void;
  onCancel?: () => Promise<void> | void;
}

const validationSchema = z.object({
  clientId: z.string().nonempty("Elija un cliente"),
  status: z.enum(AccountStatus, "Elija una opción válida"),
  type: z.enum(AccountType, "Elija una opción válida"),
});

export function AccountForm({
  initialData,
  submitError,
  onSubmit,
  onCancel,
}: Props) {
  const { data: clients } = useClientList();

  const {
    formState: { errors, isSubmitting },
    register,
    handleSubmit,
  } = useForm({
    resolver: zodResolver(validationSchema),
    values: {
      clientId: `${initialData?.clientId ?? ""}`,
      status: initialData?.status ?? AccountStatus.ACTIVE,
      type: initialData?.type ?? AccountType.CURRENT,
    },
  });

  const handleForm = async (values: z.infer<typeof validationSchema>) => {
    await onSubmit?.({
      clientId: Number(values.clientId),
      status: values.status,
      type: values.type,
    });
  };

  return (
    <form
      className="flex flex-col gap-y-4 w-fit bg-gray-800 mx-auto min-w-140 p-6 rounded-md"
      onSubmit={handleSubmit(handleForm)}
    >
      <h2 className="text-xl font-semibold text-white">
        {initialData ? "Editar" : "Nueva"} Cuenta
      </h2>
      {!initialData && (
        <>
          <div className="flex flex-col gap-y-2">
            <label htmlFor="clientId">Cliente</label>
            <select id="clientId" {...register("clientId")}>
              <option value={""}>Seleccione un usuario</option>
              {clients?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            {errors.clientId && (
              <p className="text-red-400 text-xs">{errors.clientId.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-y-2">
            <label htmlFor="type">Tipo</label>
            <select id="type" {...register("type")}>
              <option value={AccountType.CURRENT}>
                {AccountTypeLabel[AccountType.CURRENT]}
              </option>
              <option value={AccountType.SAVINGS}>
                {AccountTypeLabel[AccountType.SAVINGS]}
              </option>
            </select>
            {errors.type && (
              <p className="text-red-400 text-xs">{errors.type.message}</p>
            )}
          </div>
        </>
      )}
      {initialData && (
        <div className="flex flex-col gap-y-2">
          <label htmlFor="status">Estado</label>
          <select id="status" {...register("status")}>
            <option value={AccountStatus.ACTIVE}>
              {AccountStatusLabel[AccountStatus.ACTIVE]}
            </option>
            <option value={AccountStatus.BLOCKED}>
              {AccountStatusLabel[AccountStatus.BLOCKED]}
            </option>
            <option value={AccountStatus.CLOSED}>
              {AccountStatusLabel[AccountStatus.CLOSED]}
            </option>
          </select>
          {errors.status && (
            <p className="text-red-400 text-xs">{errors.status.message}</p>
          )}
        </div>
      )}
      <div className="flex justify-end gap-x-4">
        <button
          className="button button--secondary"
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button className="button" type="submit" disabled={isSubmitting}>
          {isSubmitting && <ImSpinner8 className="animate-spin" />}
          {isSubmitting ? "Enviando..." : "Enviar"}
        </button>
      </div>
      {submitError && (
        <p className="text-red-400 text-xs text-center">
          {submitError.message}
        </p>
      )}
    </form>
  );
}
