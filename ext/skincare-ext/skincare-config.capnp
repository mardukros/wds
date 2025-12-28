using Workerd = import "/workerd/workerd.capnp";
using SkincareBrandExt = import "skincare.capnp";

const skincareBrandExample :Workerd.Config = (
  services = [ (name = "main", worker = .skincareBrandWorker) ],
  sockets = [ ( name = "http", address = "*:8080", http = (), service = "main" ) ],
  extensions = [ SkincareBrandExt.extension ],
);

const skincareBrandWorker :Workerd.Worker = (
  modules = [ (name = "worker", esModule = embed "skincare-worker.js") ],
  compatibilityDate = "2024-01-01",
  bindings = [
    ( name = "skincareBrand",
      # wrapped bindings provide specialized API access to inner bindings
      wrapped = (
        moduleName = "skincare-brand:binding",
        innerBindings = [
          ( name = "salons", json = embed "salons.json" ),
          ( name = "formulations", json = embed "formulations.json" ),
          ( name = "procedures", json = embed "procedures.json" )
        ],
      ))
  ],
);
