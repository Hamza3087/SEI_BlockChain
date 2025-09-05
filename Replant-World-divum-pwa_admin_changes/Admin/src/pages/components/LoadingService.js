const LoadingService = {
  callbacks: [],

  setLoading(isLoading) {
    this.callbacks.forEach((callback) => callback(isLoading));
  },

  onLoadingChange(callback) {
    this.callbacks.push(callback);
    return () => {
      this.callbacks = this.callbacks.filter((cb) => cb !== callback);
    };
  }
};

export default LoadingService;
