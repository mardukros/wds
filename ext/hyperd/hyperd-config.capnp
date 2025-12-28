using Workerd = import "/workerd/workerd.capnp";
using Hyperd = import "hyperd.capnp";
using NNSCM = import "../nn-integration/nn-integration.capnp";
using NNCrm = import "../nn-crm/nn-crm.capnp";
using NNMrp = import "../nn-mrp/nn-mrp.capnp";
using NNLms = import "../nn-lms/nn-lms.capnp";

const config :Workerd.Config = (
  services = [ (name = "main", worker = .worker) ],
  sockets = [ ( name = "http", address = "*:8084", http = (), service = "main" ) ],
  extensions = [ 
    Hyperd.extension,
    NNSCM.extension,
    NNCrm.extension,
    NNMrp.extension,
    NNLms.extension
  ],
);

const worker :Workerd.Worker = (
  modules = [ (name = "worker", esModule = embed "unified-integration-worker.js") ],
  compatibilityDate = "2024-01-01",
  bindings = [
    # SCM system binding
    ( name = "neuralSupplyChain",
      wrapped = (
        moduleName = "nn-integration:binding",
        innerBindings = [
          ( name = "actors", json = embed "../nn-integration/actors.json" ),
          ( name = "relationships", json = embed "../nn-integration/relationships.json" )
        ],
      )),
    
    # CRM system binding
    ( name = "neuralCRM",
      wrapped = (
        moduleName = "nn-crm:binding",
        innerBindings = [
          ( name = "customers", json = embed "../nn-crm/customers.json" ),
          ( name = "interactions", json = embed "../nn-crm/interactions.json" )
        ],
      )),
    
    # MRP system binding
    ( name = "neuralMRP",
      wrapped = (
        moduleName = "nn-mrp:binding",
        innerBindings = [
          ( name = "materials", json = embed "../nn-mrp/materials.json" ),
          ( name = "demand", json = embed "../nn-mrp/demand.json" )
        ],
      )),
    
    # LMS system binding
    ( name = "neuralLMS",
      wrapped = (
        moduleName = "nn-lms:binding",
        innerBindings = [
          ( name = "learners", json = embed "../nn-lms/learners.json" ),
          ( name = "courses", json = embed "../nn-lms/courses.json" )
        ],
      )),
    
    # Unified integration binding
    ( name = "unifiedIntegration",
      wrapped = (
        moduleName = "hyperd:binding",
        innerBindings = [],
      ))
  ],
);
