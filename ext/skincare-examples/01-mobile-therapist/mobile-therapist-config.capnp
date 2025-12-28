using Workerd = import "/workerd/workerd.capnp";
using MobileTherapist = import "mobile-therapist.capnp";

const config :Workerd.Config = (
  services = [ (name = "main", worker = .worker) ],
  sockets = [ ( name = "http", address = "*:8080", http = (), service = "main" ) ],
  extensions = [ MobileTherapist.extension ],
);

const worker :Workerd.Worker = (
  modules = [ (name = "worker", esModule = embed "mobile-therapist-worker.js") ],
  compatibilityDate = "2024-01-01",
  bindings = [
    ( name = "mobileTherapist",
      wrapped = (
        moduleName = "mobile-therapist:binding",
        innerBindings = [
          ( name = "therapist", json = embed "therapist.json" ),
          ( name = "procedures", json = embed "procedures.json" )
        ],
      ))
  ],
);
