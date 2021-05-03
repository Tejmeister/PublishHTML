import tl = require('azure-pipelines-task-lib/task');

async function run() {
    try {
        const inputString: string | undefined = tl.getInput(
          "htmlfilepath",
          true
        );
        if (inputString == 'bad') {
            tl.setResult(tl.TaskResult.Failed, 'Bad input was given');
            return;
        }
        const newhtmlPath: string | undefined = tl.getInput("htmlfilepath", false);
        console.log("##vso[task.addattachment type=replacedhtml;name=content;]" +newhtmlPath!);
    }
    catch (err) {
        tl.setResult(tl.TaskResult.Failed, err.message);
    }
}

run();