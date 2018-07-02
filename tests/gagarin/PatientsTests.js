describe('clinical:hl7-resources-patients', function () {
  var server = meteor();
  var client = browser(server);

  it('Patients should exist on the client', function () {
    return client.execute(function () {
      expect(Patients).to.exist;
    });
  });

  it('Patients should exist on the server', function () {
    return server.execute(function () {
      expect(Patients).to.exist;
    });
  });

});
