var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
define(["require", "exports", "VSS/Controls", "TFS/DistributedTask/TaskRestClient"], function (require, exports, Controls, DT_Client) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.InfoTab = void 0;
    var InfoTab = /** @class */ (function (_super) {
        __extends(InfoTab, _super);
        function InfoTab() {
            return _super.call(this) || this;
        }
        InfoTab.prototype.initialize = function () {
            var _this = this;
            _super.prototype.initialize.call(this);
            // Get configuration that's shared between extension and the extension host
            var sharedConfig = VSS.getConfiguration();
            var vsoContext = VSS.getWebContext();
            if (sharedConfig) {
                // register your extension with host through callback
                sharedConfig.onBuildChanged(function (build) {
                    _this._initBuildInfo(build);
                    /*
                     * If any task uploaded some data using ##vso[task.addattachment] (https://github.com/Microsoft/vso-agent-tasks/blob/master/docs/authoring/commands.md)
                     * Then you could consume the data using taskclient
                     * sample code -
                     */
                    var taskClient = DT_Client.getClient();
                    taskClient
                        .getPlanAttachments(vsoContext.project.id, "build", build.orchestrationPlan.planId, "replacedhtml")
                        .then(function (taskAttachments) {
                        $.each(taskAttachments, function (index, taskAttachment) {
                            if (taskAttachment._links &&
                                taskAttachment._links.self &&
                                taskAttachment._links.self.href) {
                                var link = taskAttachment._links.self.href;
                                var attachmentName = taskAttachment.name;
                                var recId = taskAttachment.recordId;
                                var timelineId = taskAttachment.timelineId;
                                // do some thing here
                                // see how to get auth https://www.visualstudio.com/en-us/docs/report/analytics/building-extension-against-analytics-service
                                taskClient
                                    .getAttachmentContent(vsoContext.project.id, "build", build.orchestrationPlan.planId, timelineId, recId, "replacedhtml", taskAttachment.name)
                                    .then(function (attachementContent) {
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
        };
        InfoTab.prototype._initBuildInfo = function (build) { };
        return InfoTab;
    }(Controls.BaseControl));
    exports.InfoTab = InfoTab;
    InfoTab.enhance(InfoTab, $(".build-info"), {});
    // Notify the parent frame that the host has been loaded
    VSS.notifyLoadSucceeded();
});
