using Workerd = import "/workerd/workerd.capnp";
using Mediclinic = import "mediclinic.capnp";

const config :Workerd.Config = (
  services = [ (name = "main", worker = .worker) ],
  sockets = [ ( name = "http", address = "*:8080", http = (), service = "main" ) ],
  extensions = [ Mediclinic.extension ],
);

const worker :Workerd.Worker = (
  modules = [ (name = "worker", esModule = embed "mediclinic-worker.js") ],
  compatibilityDate = "2024-01-01",
  bindings = [
    ( name = "mediclinic",
      wrapped = (
        moduleName = "mediclinic:binding",
        innerBindings = [
          ( name = "clinic", json = embed "clinic.json" ),
          ( name = "formulations", json = embed "formulations.json" ),
          ( name = "procedures", json = embed "procedures.json" )
        ],
      ))
  ],
);
