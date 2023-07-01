import { readFileSync } from "fs"
import { join } from "path"
import { parse } from "yaml"
import * as core from "@actions/core"

const run = async () => {
    const tagName = core.getInput("tag-name", { required: true });

    const file = readFileSync(join(process.cwd(), "action.yml"), "utf8");

    const yml = parse(file);

    const image = yml.runs.image;

    if (!image.includes(tagName)) {
        core.warning(`Image ${image} does not include ${tagName}`);

        process.exit(1);
    }

    core.notice(`Image ${image} includes ${tagName}, proceeding...`);
};

run();