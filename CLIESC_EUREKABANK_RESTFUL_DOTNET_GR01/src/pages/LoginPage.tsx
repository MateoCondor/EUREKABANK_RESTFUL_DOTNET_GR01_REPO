import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { CiBank } from "react-icons/ci";
import z from "zod";
import { useAuth } from "../hooks/useAuth";
import { ImSpinner8 } from "react-icons/im";
import { useNavigate } from "react-router";

const validationSchema = z.object({
  username: z.string().nonempty("Este campo es obligatorio"),
  password: z.string().nonempty("Este campo es obligatorio"),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, error: mutationError, isPending } = useAuth();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(validationSchema),
    defaultValues: {
      password: undefined,
      username: undefined,
    },
  });

  const onSubmit = async (values: z.infer<typeof validationSchema>) => {
    await login({
      dto: values,
    });

    reset();
    navigate("/dashboard");
  };

  return (
    <main className="h-dvh text-center content-center">
      <section className="text-center flex flex-col gap-y-8 items-center">
        <header className="flex flex-col gap-y-2 items-center">
          <div className="bg-teal-700 w-fit rounded-full p-3">
            <CiBank size={"3rem"} />
          </div>
          <h1 className="text-3xl font-bold">EurekaBank</h1>
          <p className="text-gray-400 text-sm">
            Cliente Escritorio: RESTFUL - DotNET
          </p>
        </header>

        <form
          className="bg-gray-800 w-fit rounded-md p-6 text-left flex flex-col gap-y-4 min-w-105"
          onSubmit={handleSubmit(onSubmit)}
        >
          <h2 className="text-xl text-center font-semibold">Iniciar Sesión</h2>
          <div className="flex flex-col gap-y-2">
            <label htmlFor="username">Usuario</label>
            <input
              type="text"
              id="username"
              autoFocus
              {...register("username")}
            />
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
          <div>
            <button
              type="submit"
              className="button w-full"
              disabled={isPending}
            >
              {isPending && <ImSpinner8 className="animate-spin" />}
              {isPending ? "Ingresando..." : "Ingresar"}
            </button>
          </div>
          {mutationError && (
            <p className="text-red-400 text-xs text-center">
              {mutationError.message}
            </p>
          )}
        </form>
        <footer>
          <p className="text-gray-400 text-xs">
            © 2026 EurekaBank • Arquitectura GR01
          </p>
        </footer>
      </section>
    </main>
  );
}
