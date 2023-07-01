const github = require('@actions/github');
const core = require('@actions/core');

const run = async () => {
    const owner = core.getInput("owner", { required: true });
    const repo = core.getInput("repo", { required: true });
    const tagName = core.getInput("tag-name", { required: true });
    const myToken = core.getInput('myToken', { required: true });

    const octokit = github.getOctokit(myToken);

    await octokit.rest.repos.createRelease({ owner, repo, tag_name: tagName, name: tagName, draft: false, prerelease: false });

    core.notice(`Release ${tagName} created`);
};

run();