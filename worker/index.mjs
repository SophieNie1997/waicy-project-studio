import { handleIdeaChoicesRequest } from "./ideaChoicesCore.mjs";

export default {
  fetch(request, env) {
    return handleIdeaChoicesRequest(request, env);
  },
};
