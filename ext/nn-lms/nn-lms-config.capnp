using Workerd = import "/workerd/workerd.capnp";
using NNLms = import "nn-lms.capnp";

const config :Workerd.Config = (
  services = [ (name = "main", worker = .worker) ],
  sockets = [ ( name = "http", address = "*:8083", http = (), service = "main" ) ],
  extensions = [ NNLms.extension ],
);

const worker :Workerd.Worker = (
  modules = [ (name = "worker", esModule = embed "nn-lms-worker.js") ],
  compatibilityDate = "2024-01-01",
  bindings = [
    ( name = "neuralLMS",
      wrapped = (
        moduleName = "nn-lms:binding",
        innerBindings = [
          ( name = "learners", json = embed "learners.json" ),
          ( name = "courses", json = embed "courses.json" )
        ],
      ))
  ],
);
