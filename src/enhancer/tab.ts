import Controls = require("VSS/Controls");
import VSS_Service = require("VSS/Service");
import TFS_Build_Contracts = require("TFS/Build/Contracts");
import TFS_Build_Extension_Contracts = require("TFS/Build/ExtensionContracts");
import DT_Client = require("TFS/DistributedTask/TaskRestClient");

export class InfoTab extends Controls.BaseControl {
  constructor() {
    super();
  }

  public initialize(): void {
    super.initialize();
    // Get configuration that's shared between extension and the extension host
    var sharedConfig: TFS_Build_Extension_Contracts.IBuildResultsViewExtensionConfig = VSS.getConfiguration();
    var vsoContext = VSS.getWebContext();
    if (sharedConfig) {
      // register your extension with host through callback
      sharedConfig.onBuildChanged((build: TFS_Build_Contracts.Build) => {
        this._initBuildInfo(build);

        /*
         * If any task uploaded some data using ##vso[task.addattachment] (https://github.com/Microsoft/vso-agent-tasks/blob/master/docs/authoring/commands.md)
         * Then you could consume the data using taskclient
         * sample code -
         */
        var taskClient = DT_Client.getClient();
        taskClient
          .getPlanAttachments(
            vsoContext.project.id,
            "build",
            build.orchestrationPlan.planId,
            "replacedhtml"
          )
          .then((taskAttachments) => {
            $.each(taskAttachments, (index, taskAttachment) => {
              if (
                taskAttachment._links &&
                taskAttachment._links.self &&
                taskAttachment._links.self.href
              ) {
                var link = taskAttachment._links.self.href;
                var attachmentName = taskAttachment.name;
                var recId = taskAttachment.recordId;
                var timelineId = taskAttachment.timelineId;
                // do some thing here
                // see how to get auth https://www.visualstudio.com/en-us/docs/report/analytics/building-extension-against-analytics-service
              
                taskClient
                  .getAttachmentContent(
                    vsoContext.project.id,
                    "build",
                    build.orchestrationPlan.planId,
                    timelineId,
                    recId,
                    "replacedhtml",
                    taskAttachment.name
                  )
                  .then((attachementContent) => {
                    function arrayBufferToString(buffer) {
                      var arr = new Uint8Array(buffer);
                      var str = String.fromCharCode.apply(String, arr);
                      return str;
                    }
                    var first = arrayBufferToString(attachementContent);
                    document.body.style.overflow = "visible";

                    var s = document.createElement("script");
                    s.innerHTML = first;
                    s.async = false;

                    //s.type = "text/javascript";
                    document.getElementById("replacedhtml").appendChild(s);
                  });
              }
            });
          });
      });
    }
  }

  private _initBuildInfo(build: TFS_Build_Contracts.Build) {}
}

InfoTab.enhance(InfoTab, $(".build-info"), {});

// Notify the parent frame that the host has been loaded
VSS.notifyLoadSucceeded();
