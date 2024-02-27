/**
 * This an example, try to extend your own logic.
 */
export default async (options) => {
  console.log(`Received options: ${JSON.stringify(options, null, 2)}`);
  await $`echo test`;
};
