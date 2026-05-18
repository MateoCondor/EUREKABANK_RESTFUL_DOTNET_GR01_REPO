import { useForm } from "react-hook-form";
import { ClientRequest } from "../dto/client";
import { zodResolver } from "@hookform/resolvers/zod";
import z from "zod";
import { ClientStatus, ClientStatusLabel } from "../enum/client.enum";
import { ImSpinner8 } from "react-icons/im";

interface Props {
  initialData?: ClientRequest | null;
  submitError?: Error | null;
  onSubmit?: (dto: ClientRequest) => Promise<void> | void;
  onCancel?: () => Promise<void> | void;
}

const validationSchema = z.object({
  name: z
    .string()
    .min(3, "El nombre es muy corto")
    .max(100, "El nombre es muy largo"),
  dni: z.string().min(10, "El dni es muy corto").max(20, "El dni es muy largo"),
  email: z.email("Utilice un correo electrónico valido"),
  phone: z.string().length(10, "El número debe ser de 10 dígitos"),
  status: z.enum(ClientStatus, "Elija una opción válida"),
  username: z.string().max(50, "El usuario es muy largo"),
  password: z.string().max(20, "La contraseña es muy larga").optional(),
});

export function ClientForm({
  initialData,
  submitError,
  onSubmit,
  onCancel,
}: Props) {
  const {
    formState: { errors, isSubmitting },
    register,
    handleSubmit,
  } = useForm({
    resolver: zodResolver(validationSchema),
    values: {
      dni: initialData?.dni ?? "",
      email: initialData?.email ?? "",
      name: initialData?.name ?? "",
      password: undefined,
      phone: initialData?.phone ?? "",
      status: initialData?.status ?? ClientStatus.ACTIVE,
      username: initialData?.username ?? "",
    },
  });

  const handleForm = async (values: z.infer<typeof validationSchema>) => {
    await onSubmit?.({
      dni: values.dni,
      email: values.email,
      name: values.name,
      password: values.password ?? null,
      phone: values.phone,
      status: values.status,
      username: values.username,
    });
  };

  return (
    <form
      className="flex flex-col gap-y-4 w-fit bg-gray-800 mx-auto min-w-140 p-6 rounded-md"
      onSubmit={handleSubmit(handleForm)}
    >
      <h2 className="text-xl font-semibold text-white">
        {initialData ? "Editar" : "Nuevo"} Cliente
      </h2>
      <div className="flex flex-col gap-y-2">
        <label htmlFor="name">Nombre completo</label>
        <input type="text" id="name" {...register("name")} />
        {errors.name && (
          <p className="text-red-400 text-xs">{errors.name.message}</p>
        )}
      </div>
      <div className="flex flex-col gap-y-2">
        <label htmlFor="dni">DNI / Cédula</label>
        <input type="text" id="dni" {...register("dni")} />
        {errors.dni && (
          <p className="text-red-400 text-xs">{errors.dni.message}</p>
        )}
      </div>
      <div className="flex flex-col gap-y-2">
        <label htmlFor="email">Email</label>
        <input type="email" id="email" {...register("email")} />
        {errors.email && (
          <p className="text-red-400 text-xs">{errors.email.message}</p>
        )}
      </div>
      <div className="flex flex-col gap-y-2">
        <label htmlFor="phone">Teléfono</label>
        <input type="tel" id="phone" {...register("phone")} />
        {errors.phone && (
          <p className="text-red-400 text-xs">{errors.phone.message}</p>
        )}
      </div>
      <div className="flex flex-col gap-y-2">
        <label htmlFor="status">Estado</label>
        <select id="status" {...register("status")} disabled={!initialData}>
          <option value={ClientStatus.ACTIVE}>
            {ClientStatusLabel[ClientStatus.ACTIVE]}
          </option>
          <option value={ClientStatus.INACTIVE}>
            {ClientStatusLabel[ClientStatus.INACTIVE]}
          </option>
        </select>
        {errors.status && (
          <p className="text-red-400 text-xs">{errors.status.message}</p>
        )}
      </div>
      {!initialData && (
        <fieldset className="flex flex-col gap-y-4">
          <legend className="text-sm">Credenciales de acceso</legend>
          <div className="flex flex-col gap-y-2">
            <label htmlFor="username">Usuario</label>
            <input type="text" id="username" {...register("username")} />
            {errors.username && (
              <p className="text-red-400 text-xs">{errors.username.message}</p>
            )}
          </div>
          <div className="flex flex-col gap-y-2">
            <label htmlFor="password">Contraseña</label>
            <input type="password" id="password" {...register("password")} />
            {errors.password && (
              <p className="text-red-400 text-xs">{errors.password.message}</p>
            )}
          </div>
        </fieldset>
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
