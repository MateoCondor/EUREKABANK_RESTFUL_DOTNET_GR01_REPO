import z from "zod";
import { WithdrawRequest } from "../dto/transaction";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAccountList } from "../hooks/useAccountList";
import { ImSpinner8 } from "react-icons/im";
import { TiArrowUpThick } from "react-icons/ti";

interface Props {
  submitError?: Error | null;
  onSubmit?: (dto: WithdrawRequest) => Promise<void> | void;
  onCancel?: () => Promise<void> | void;
}

const validationSchema = z.object({
  accountId: z.string().nonempty("Seleccione una cuenta"),
  amount: z
    .number("Este campo es obligatorio")
    .positive("Ingrese un valor positivo"),
  description: z.string().max(50, "La descripción es muy larga").optional(),
});

export function WithdrawForm({ submitError, onSubmit, onCancel }: Props) {
  const { data: accounts } = useAccountList();

  const {
    formState: { errors, isSubmitting },
    register,
    handleSubmit,
  } = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      accountId: "",
      amount: 0,
      description: undefined,
    },
  });

  const handleForm = async (values: z.infer<typeof validationSchema>) => {
    await onSubmit?.({
      accountId: Number(values.accountId),
      amount: values.amount,
      description: values.description ?? "",
    });
  };

  return (
    <form
      className="flex flex-col gap-y-4 w-fit bg-gray-800 mx-auto min-w-140 p-6 rounded-md"
      onSubmit={handleSubmit(handleForm)}
    >
      <h2 className="text-xl font-semibold text-white flex gap-x-2 items-center">
        <span
          className={`w-8 h-8 rounded-full content-center ${"text-red-500 bg-red-900/50"}`}
        >
          <TiArrowUpThick className="mx-auto" />
        </span>{" "}
        Nuevo retiro
      </h2>

      <div className="flex flex-col gap-y-2">
        <label htmlFor="accountId">Cuenta</label>
        <select id="accountId" {...register("accountId")}>
          <option value={""}>Seleccione una cuenta</option>
          {accounts?.map((a) => (
            <option key={a.id} value={a.id}>
              {a.accountNumber}
            </option>
          ))}
        </select>
        {errors.accountId && (
          <p className="text-red-400 text-xs">{errors.accountId.message}</p>
        )}
      </div>
      <div className="flex flex-col gap-y-2">
        <label htmlFor="amount">Cantidad ($)</label>
        <input
          type="number"
          id="amount"
          {...register("amount", { valueAsNumber: true })}
        />
        {errors.amount && (
          <p className="text-red-400 text-xs">{errors.amount.message}</p>
        )}
      </div>
      <div className="flex flex-col gap-y-2">
        <label htmlFor="description">Descripción (opcional)</label>
        <input type="text" id="description" {...register("description")} />
        {errors.description && (
          <p className="text-red-400 text-xs">{errors.description.message}</p>
        )}
      </div>

      <div className="flex justify-end gap-x-4">
        <button
          className="button button--secondary"
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button
          className="text-white bg-red-700 rounded-md px-4 py-2"
          type="submit"
          disabled={isSubmitting}
        >
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
