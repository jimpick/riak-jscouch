// By Jim Pick
// Public Domain

// This could be a lot nicer, but I'll leave it as is so I can
// push it up quickly and be done with it. :-)

$(function(){
  $('#insertData').click(function() {
    var client = new RiakClient();
    var insert = function(id, body) {
      var obj = new RiakObject('pictures', id, client, body);
      obj.contentType = 'application/json';
      obj.store(function(status, obj, request) {
        $('#results').html("<pre>" + JSON.stringify(request,null,2) + "</pre>");
      });
    };

    // From jscouch.documents.js
    var now = new Date().getTime();
    var millisInHHour = 1000*60*30;

    insert(1, {
      name: "fish.jpg",
      created_at: new Date(now + millisInHHour*Math.random()).toUTCString(),
      user: "bob",
      type: "jpeg",
      camera: "nikon",
      info: {
        width: 100,
        height: 200,
        size: 12345
      },
      tags: ["tuna","shark"]
    });
    insert(2, { 
      name: 'trees.jpg', 
      created_at: new Date(now + millisInHHour*Math.random()).toUTCString(),
      user: 'john',
      type: 'jpeg', 
      camera: 'canon',
      info: {
        width: 30, 
        height: 250, 
        size: 32091
      },
      tags: [ 'oak' ]
    });
    insert(3, { 
      name: 'snow.png', 
      created_at: new Date(now + millisInHHour*Math.random()).toUTCString(),
      user: 'john',
      type: 'png', 
      camera: 'canon',
      info: {
        width: 64, 
        height: 64, 
        size: 1253
      },
      tags: [ 'tahoe', 'powder' ]
    });
    insert(4, {
      name: 'hawaii.png', 
      created_at: new Date(now + millisInHHour*Math.random()).toUTCString(),
      user: 'john',
      type: 'png', 
      camera: 'nikon',
      info: {
        width: 128, 
        height: 64, 
        size: 92834
      },
      tags: [ 'maui', 'tuna' ]
    });
    insert(5, { 
      name: 'hawaii.gif', 
      created_at: new Date(now + millisInHHour*Math.random()).toUTCString(),
      user: 'bob',
      type: 'gif', 
      camera: 'canon',
      info: {
        width: 320, 
        height: 128, 
        size: 49287
      },
      tags: [ 'maui' ]
    });
    insert(6, { 
      name: 'island.gif', 
      created_at: new Date(now + millisInHHour*Math.random()).toUTCString(),
      user: 'zztop',
      type: 'gif', 
      camera: 'nikon',
      info: {
        width: 640, 
        height: 480, 
        size: 50398
      },
      tags: [ 'maui' ]
    });

  });

  $('#allPictures').click(function() {
    var client = new RiakClient();
    client.bucket('pictures', function(bucket, req) {
      var mapPhase = bucket.map({
        language: 'javascript',
        name: 'Riak.mapValuesJson',
        keep: true
      });
      mapPhase.run(function(flag, results, req) {
        $('#results').html(
          "<pre>\n" + 
          "Flag:\n" + 
          JSON.stringify(flag,null,2) + "\n" +
          "Results:\n" + 
          JSON.stringify(results,null,2) + "\n" +
          "Request:\n" + 
          JSON.stringify(req,null,2) + "\n" +
          "</pre>"
        );
      });
    });
  });

  $('#sortPicturesByUser').click(function() {
    var client = new RiakClient();
    client.bucket('pictures', function(bucket, req) {
      var mapPhase = bucket.map({
        language: 'javascript',
        source: function(v) {
          var doc = JSON.parse(v.values[0].data);
          return [[doc.user, v.key]];
        },
        keep: false
      });
      var reducePhase = mapPhase.reduce({
        language: 'javascript',
        name: 'Riak.reduceSort',
        keep: true
      });
      reducePhase.run(function(flag, results, req) {
        $('#results').html(
          "<pre>\n" + 
          "Flag:\n" + 
          JSON.stringify(flag,null,2) + "\n" +
          "Results:\n" + 
          JSON.stringify(results,null,2) + "\n" +
          "Request:\n" + 
          JSON.stringify(req,null,2) + "\n" +
          "</pre>"
        );
      });
    });
  });

  $('#sortPicturesByDate').click(function() {
    var client = new RiakClient();
    client.bucket('pictures', function(bucket, req) {
      var mapPhase = bucket.map({
        language: 'javascript',
        source: function(v) {
          var doc = JSON.parse(v.values[0].data);
          return [[Date.parse(doc.created_at), v.key]];
        },
        keep: false
      });
      var reducePhase = mapPhase.reduce({
        language: 'javascript',
        source: function(value, arg) {
          var sortByFirstElementNumeric = function(first, second) {
            return first[0] - second[0];
          };
          value.sort(sortByFirstElementNumeric);
          return value;
        },
        keep: true
      });
      reducePhase.run(function(flag, results, req) {
        $('#results').html(
          "<pre>\n" + 
          "Flag:\n" + 
          JSON.stringify(flag,null,2) + "\n" +
          "Results:\n" + 
          JSON.stringify(results,null,2) + "\n" +
          "Request:\n" + 
          JSON.stringify(req,null,2) + "\n" +
          "</pre>"
        );
      });
    });
  });

  $('#totalSizeOfAllImages').click(function() {
    var client = new RiakClient();
    client.bucket('pictures', function(bucket, req) {
      var mapPhase = bucket.map({
        language: 'javascript',
        source: function(v) {
          var doc = JSON.parse(v.values[0].data);
          return [doc.info.size];
        },
        keep: false
      });
      var reducePhase = mapPhase.reduce({
        language: 'javascript',
        name: 'Riak.reduceSum',
        keep: true
      });
      reducePhase.run(function(flag, results, req) {
        $('#results').html(
          "<pre>\n" + 
          "Flag:\n" + 
          JSON.stringify(flag,null,2) + "\n" +
          "Results:\n" + 
          JSON.stringify(results,null,2) + "\n" +
          "Request:\n" + 
          JSON.stringify(req,null,2) + "\n" +
          "</pre>"
        );
      });
    });
  });

  $('#countPicturesByUser').click(function() {
    var client = new RiakClient();
    client.bucket('pictures', function(bucket, req) {
      var mapPhase = bucket.map({
        language: 'javascript',
        source: function(v) {
          var doc = JSON.parse(v.values[0].data);
          return [[doc.user, 1]];
        },
        keep: false
      });
      var reducePhase = mapPhase.reduce({
        language: 'javascript',
        source: function(value, arg) {
          var userCounts = {};
          for each (var picture in value) {
            var user = picture[0];
            var count = picture[1];
            userCounts[user] = (userCounts[user] || 0) + count;
          }
          var results = [];
          for (var user in userCounts) {
            results.push([user, userCounts[user]]);
          }
          return results;
        },
        keep: true
      });
      reducePhase.run(function(flag, results, req) {
        $('#results').html(
          "<pre>\n" + 
          "Flag:\n" + 
          JSON.stringify(flag,null,2) + "\n" +
          "Results:\n" + 
          JSON.stringify(results,null,2) + "\n" +
          "Request:\n" + 
          JSON.stringify(req,null,2) + "\n" +
          "</pre>"
        );
      });
    });
  });

  $('#countPicturesByHour').click(function() {
    var client = new RiakClient();
    client.bucket('pictures', function(bucket, req) {
      var mapPhase = bucket.map({
        language: 'javascript',
        source: function(v) {
          var doc = JSON.parse(v.values[0].data);
          return [[Math.floor(Date.parse(doc.created_at)/1000/60/60), 1]];
        },
        keep: false
      });
      var reducePhase = mapPhase.reduce({
        language: 'javascript',
        source: function(value, arg) {
          var hourCounts = {};
          for each (var picture in value) {
            var hour = picture[0];
            var count = picture[1];
            hourCounts[hour] += (hourCounts[hour] || 0) + count;
          }
          var results = [];
          for (var hour in hourCounts) {
            results.push([hour, hourCounts[hour]]);
          }
          return results;
        },
        keep: true
      });
      reducePhase.run(function(flag, results, req) {
        $('#results').html(
          "<pre>\n" + 
          "Flag:\n" + 
          JSON.stringify(flag,null,2) + "\n" +
          "Results:\n" + 
          JSON.stringify(results,null,2) + "\n" +
          "Request:\n" + 
          JSON.stringify(req,null,2) + "\n" +
          "</pre>"
        );
      });
    });
  });

  $('#minWidthAndHeight').click(function() {
    var client = new RiakClient();
    client.bucket('pictures', function(bucket, req) {
      var mapPhase = bucket.map({
        language: 'javascript',
        source: function(v) {
          var doc = JSON.parse(v.values[0].data);
          return [["width", doc.info.width], 
                  ["height", doc.info.height]];
        },
        keep: false
      });
      var reducePhase = mapPhase.reduce({
        language: 'javascript',
        source: function(value, arg) {
          var propertyMinimums = {};
          for each (var metric in value) {
            var property = metric[0];
            var measurement = metric[1];
            if (property in propertyMinimums) {
              if (measurement < propertyMinimums[property]) {
                propertyMinimums[property] = measurement;
              }
            } else {
              propertyMinimums[property] = measurement;
            }
          }
          var results = [];
          for (var property in propertyMinimums) {
            results.push([property, propertyMinimums[property]]);
          }
          return results;
        },
        keep: true
      });
      reducePhase.run(function(flag, results, req) {
        $('#results').html(
          "<pre>\n" + 
          "Flag:\n" + 
          JSON.stringify(flag,null,2) + "\n" +
          "Results:\n" + 
          JSON.stringify(results,null,2) + "\n" +
          "Request:\n" + 
          JSON.stringify(req,null,2) + "\n" +
          "</pre>"
        );
      });
    });
  });

  $('#minAndMaxWidthAndHeight').click(function() {
    var client = new RiakClient();
    client.bucket('pictures', function(bucket, req) {
      var mapPhase = bucket.map({
        language: 'javascript',
        source: function(v) {
          var doc = JSON.parse(v.values[0].data);
          return [["width", {min: doc.info.width, max: doc.info.width}], 
                  ["height", {min: doc.info.height, max: doc.info.height}]];
        },
        keep: false
      });
      var reducePhase = mapPhase.reduce({
        language: 'javascript',
        source: function(value, arg) {
          var propertyMinMax = {};
          for each (var metric in value) {
            var property = metric[0];
            var min = metric[1].min;
            var max = metric[1].max;
            if (property in propertyMinMax) {
              if (min < propertyMinMax[property].min) {
                propertyMinMax[property].min = min;
              }
              if (max > propertyMinMax[property].max) { // Max
                propertyMinMax[property].max = max;
              }
            } else {
              propertyMinMax[property] = {};
              propertyMinMax[property].min = min;
              propertyMinMax[property].max = max;
            }
          }
          var results = [];
          for (var property in propertyMinMax) {
            results.push([property, propertyMinMax[property]]);
          }
          return results;
        },
        keep: true
      });
      reducePhase.run(function(flag, results, req) {
        $('#results').html(
          "<pre>\n" +
          "Flag:\n" +
          JSON.stringify(flag,null,2) + "\n" +
          "Results:\n" +
          JSON.stringify(results,null,2) + "\n" +
          "Request:\n" +
          JSON.stringify(req,null,2) + "\n" +
          "</pre>"
        );
      });
    });
  });

  $('#uniqueCamerasForAUser1').click(function() {
    var client = new RiakClient();
    client.bucket('pictures', function(bucket, req) {
      var mapPhase = bucket.map({
        language: 'javascript',
        source: function(v) {
          var doc = JSON.parse(v.values[0].data);
          var val = {};
          val[doc.camera] = 1;
          return [[doc.user, val]];
        },
        keep: false
      });
      var reducePhase = mapPhase.reduce({
        language: 'javascript',
        source: function(mappedUserCameras, arg) {
          var userCameras = {};
          for each (var mappedUserCamera in mappedUserCameras) {
            var userName = mappedUserCamera[0];
            var cameras = mappedUserCamera[1];
            if (userName in userCameras) {
              for (var cameraName in cameras) {
                userCameras[userName][cameraName] = 
                  (userCameras[userName][cameraName] || 0) +
                  cameras[cameraName];
              }
            } else {
              userCameras[userName] = cameras;
            }
          }
          var results = [];
          for (var userName in userCameras) {
            results.push([userName, userCameras[userName]]);
          }
          return results;
        },
        keep: true
      });
      reducePhase.run(function(flag, results, req) {
        $('#results').html(
          "<pre>\n" +
          "Flag:\n" +
          JSON.stringify(flag,null,2) + "\n" +
          "Results:\n" +
          JSON.stringify(results,null,2) + "\n" +
          "Request:\n" +
          JSON.stringify(req,null,2) + "\n" +
          "</pre>"
        );
      });
    });
  });

  $('#uniqueCamerasForAUser2').click(function() {
    var client = new RiakClient();
    client.bucket('pictures', function(bucket, req) {
      var mapPhase = bucket.map({
        language: 'javascript',
        source: function(v) {
          var doc = JSON.parse(v.values[0].data);
          return [[[doc.user, doc.camera], 1]];
        },
        keep: false
      });
      var reducePhase = mapPhase.reduce({
        language: 'javascript',
        source: function(value, arg) {
          var userCameraCounts = {};
          for each (var picture in value) {
            var userCamera = JSON.stringify(picture[0]);
            var count = picture[1];
            userCameraCounts[userCamera] =
              (userCameraCounts[userCamera] || 0) + count;
          }
          var results = [];
          for (var userCamera in userCameraCounts) {
            results.push([JSON.parse(userCamera), userCameraCounts[userCamera]]);
          }
          return results;
        },
        keep: true
      });
      reducePhase.run(function(flag, results, req) {
        $('#results').html(
          "<pre>\n" +
          "Flag:\n" +
          JSON.stringify(flag,null,2) + "\n" +
          "Results:\n" +
          JSON.stringify(results,null,2) + "\n" +
          "Request:\n" +
          JSON.stringify(req,null,2) + "\n" +
          "</pre>"
        );
      });
    });
  });

});
