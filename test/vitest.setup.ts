import { beforeEach, afterEach, afterAll } from "vitest";
import { testFsCleanup } from "@moonwave99/test-fs";

beforeEach(async (context) => {
  await testFsCleanup(context.task.id);
});

afterEach(async (context) => {
  await testFsCleanup(context.task.id);
});

afterAll(async () => {
  await testFsCleanup();
});
