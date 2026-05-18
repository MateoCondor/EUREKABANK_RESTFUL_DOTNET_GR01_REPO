import { CiBank } from "react-icons/ci";
import { NavLink, Outlet } from "react-router";

export function MainLayout() {
  return (
    <div className="grid grid-cols-[auto_1fr] h-dvh">
      <header className="grid grid-rows-[auto_1fr_auto] gap-y-4 min-w-65 bg-gray-800 h-full px-3 py-2">
        <article className="flex gap-x-2 items-center py-2 border-b border-gray-600">
          <div className="bg-teal-700 w-fit rounded-full p-2">
            <CiBank size={"1.5rem"} />
          </div>
          <div>
            <h1 className="text-xl text-teal-700 font-bold">EurekaBank</h1>
            <p className="text-gray-500 text-sm">Panel Admin</p>
          </div>
        </article>
        <nav className="list-none flex flex-col gap-y-2">
          <li>
            <NavLink
              className={({ isActive }) =>
                `nav-link ${isActive ? "nav-link--active" : ""}`
              }
              to={"/dashboard"}
            >
              Inicio
            </NavLink>
          </li>
          <li>
            <NavLink
              className={({ isActive }) =>
                `nav-link ${isActive ? "nav-link--active" : ""}`
              }
              to={"/clients"}
            >
              Clientes
            </NavLink>
          </li>
          <li>
            <NavLink
              className={({ isActive }) =>
                `nav-link ${isActive ? "nav-link--active" : ""}`
              }
              to={"/accounts"}
            >
              Cuentas
            </NavLink>
          </li>
          <li>
            <NavLink
              className={({ isActive }) =>
                `nav-link ${isActive ? "nav-link--active" : ""}`
              }
              to={"/transactions"}
            >
              Transacciones
            </NavLink>
          </li>
          <li>
            <NavLink className="nav-link nav-link--danger" to={"/"}>
              Cerrar sesión
            </NavLink>
          </li>
        </nav>
        <div className="py-2 border-t border-gray-600">
          <p className="text-gray-400 text-xs text-center">
            © 2026 EurekaBank • Arquitectura GR01
          </p>
        </div>
      </header>
      <div className="h-full">
        <Outlet />
      </div>
    </div>
  );
}
