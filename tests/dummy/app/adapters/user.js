import DS from 'ember-data';

export default DS.JSONAPIAdapter.extend({
  normalizeErrorResponse(status, headers, payload) {
    if (payload && typeof payload === 'object' && payload.error) {
      return payload.error;
    } else {
      return [
        {
          status: `${status}`,
          title: "The backend responded with an error",
          detail: `${payload}`
        }
      ];
    }
  }
});
