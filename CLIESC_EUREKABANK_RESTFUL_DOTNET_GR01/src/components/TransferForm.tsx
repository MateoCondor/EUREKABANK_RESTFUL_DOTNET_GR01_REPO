import z from "zod";
import { TransferRequest } from "../dto/transaction";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useAccountList } from "../hooks/useAccountList";
import { ImSpinner8 } from "react-icons/im";
import { MdCompareArrows } from "react-icons/md";
import { TransferType, TransferTypeLabel } from "../enum/transaciton.enum";

interface Props {
  submitError?: Error | null;
  onSubmit?: (dto: TransferRequest) => Promise<void> | void;
  onCancel?: () => Promise<void> | void;
}

const validationSchema = z.object({
  sourceAccountId: z.string().nonempty("Seleccione una cuenta de origen"),
  targetAccountId: z.string().nonempty("Seleccione una cuenta de destino"),
  transferType: z.enum(TransferType),
  amount: z
    .number("Este campo es obligatorio")
    .positive("Ingrese un valor positivo"),
  description: z.string().max(50, "La descripción es muy larga").optional(),
});

export function TransferForm({ submitError, onSubmit, onCancel }: Props) {
  const { data: accounts } = useAccountList();

  const {
    formState: { errors, isSubmitting },
    register,
    handleSubmit,
  } = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      sourceAccountId: "",
      targetAccountId: "",
      transferType: TransferType.CREDIT,
      amount: 0,
      description: undefined,
    },
  });

  const handleForm = async (values: z.infer<typeof validationSchema>) => {
    await onSubmit?.({
      sourceAccountId: Number(values.sourceAccountId),
      targetAccountId: Number(values.targetAccountId),
      transferType: values.transferType,
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
          className={`w-8 h-8 rounded-full content-center ${"text-yellow-500 bg-yellow-900/50"}`}
        >
          <MdCompareArrows className="mx-auto" />
        </span>{" "}
        Nueva transferencia
      </h2>

      <div className="flex flex-col gap-y-2">
        <label htmlFor="sourceAccountId">Cuenta</label>
        <select id="sourceAccountId" {...register("sourceAccountId")}>
          <option value={""}>Seleccione una cuenta de origen</option>
          {accounts?.map((a) => (
            <option key={a.id} value={a.id}>
              {a.accountNumber}
            </option>
          ))}
        </select>
        {errors.sourceAccountId && (
          <p className="text-red-400 text-xs">
            {errors.sourceAccountId.message}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-y-2">
        <label htmlFor="targetAccountId">Cuenta</label>
        <select id="targetAccountId" {...register("targetAccountId")}>
          <option value={""}>Seleccione una cuenta de destino</option>
          {accounts?.map((a) => (
            <option key={a.id} value={a.id}>
              {a.accountNumber}
            </option>
          ))}
        </select>
        {errors.targetAccountId && (
          <p className="text-red-400 text-xs">
            {errors.targetAccountId.message}
          </p>
        )}
      </div>
      <div className="flex flex-col gap-y-2">
        <label htmlFor="transferType">Estado</label>
        <select id="transferType" {...register("transferType")}>
          <option value={TransferType.CREDIT}>
            {TransferTypeLabel[TransferType.CREDIT]}
          </option>
          <option value={TransferType.DEBIT}>
            {TransferTypeLabel[TransferType.DEBIT]}
          </option>
        </select>
        {errors.transferType && (
          <p className="text-red-400 text-xs">{errors.transferType.message}</p>
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
          className="text-white bg-yellow-700 rounded-md px-4 py-2"
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
