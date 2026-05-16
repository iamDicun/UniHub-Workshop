/**
 * Pipe-Filter Pipeline Orchestrator
 * 
 * Runs a sequence of filters. Each filter receives the output of the previous
 * filter as its input. The pipeline tracks state and can be extended with
 * new filters without modifying existing ones.
 */
class Pipeline {
  constructor() {
    this.filters = [];
    this.context = {};
  }

  /**
   * Add a filter to the pipeline.
   * @param {Function} filterFn - async (input, context) => output
   * @param {string} name - filter name for logging
   */
  use(filterFn, name = 'unnamed') {
    this.filters.push({ fn: filterFn, name });
    return this;
  }

  /**
   * Set shared context (metadata, config, etc.) available to all filters.
   */
  setContext(ctx) {
    this.context = { ...this.context, ...ctx };
    return this;
  }

  /**
   * Execute the pipeline sequentially.
   * Each filter's output becomes the next filter's input.
   * @param {*} initialInput
   * @returns {*} final output
   */
  async run(initialInput) {
    let data = initialInput;
    for (const filter of this.filters) {
      try {
        data = await filter.fn(data, this.context);
      } catch (error) {
        throw new Error(
          `Pipeline filter "${filter.name}" failed: ${error.message}`
        );
      }
    }
    return data;
  }
}

export default Pipeline;
