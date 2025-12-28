using Workerd = import "/workerd/workerd.capnp";
using SmallSalon = import "small-salon.capnp";

const config :Workerd.Config = (
  services = [ (name = "main", worker = .worker) ],
  sockets = [ ( name = "http", address = "*:8080", http = (), service = "main" ) ],
  extensions = [ SmallSalon.extension ],
);

const worker :Workerd.Worker = (
  modules = [ (name = "worker", esModule = embed "small-salon-worker.js") ],
  compatibilityDate = "2024-01-01",
  bindings = [
    ( name = "smallSalon",
      wrapped = (
        moduleName = "small-salon:binding",
        innerBindings = [
          ( name = "salon", json = embed "salon.json" ),
          ( name = "formulations", json = embed "formulations.json" ),
          ( name = "procedures", json = embed "procedures.json" )
        ],
      ))
  ],
);
