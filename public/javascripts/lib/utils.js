Utils = {
  loadTemplates: function() {
    var templates = {};
    $('*[type="text/x-js-template"]').map(function() {
      var name = $(this).attr('name');
      var source = $(this).html().replace('&gt;', '>');
      if(name.split('/')[1][0] == '_') { Handlebars.registerPartial(name.replace('/', ''), source) }
      templates[name] = Handlebars.compile(source);
    });
    return templates;
  },
  queryString: function(params) {
    if(!params) return '';
    var query = _.compact(_.map(params, function(value, key) { return value ? key + '=' + value : null }));
    return query.length > 0 ? '?' + query.join('&') : '';
  },
  duration: function(started, finished) {
    started  = new Date(started);
    finished = finished ? new Date(finished) : new Date();
    return started ? Math.round((finished - started) / 1000) : 0;
  },
  activateTab: function(element, tab) {
    $('.tabs li', element).removeClass('active');
    $('#tab_' + tab.toLowerCase(), element).addClass('active');
  },
  animated: function(element) {
    return !!element.queue()[0];
  },
  flash: function(element) {
    if(!element.length == 0 && !Utils.animated(element)) {
      Utils._flash(element);
    }
  },
  _flash: function(element) {
    element.effect('highlight', {}, 1000, function () {
      Utils._flash(element)
    });
  },
  unflash: function(element) {
    if(!element.length == 0) {
      element.stop().css({ 'background-color': '', 'background-image': '' });
    }
  },
  filterLog: function(string) {
    // string = Handlebars.Utils.escapeExpression(string);
    string = Utils.deansi(string);
    string = Utils.foldLog(string);
    return string;
  },
  deansi: function(string) {
    string = string || '';
    string = string.replace(new RegExp(String.fromCharCode(27), 'g'), '');
    string = string.replace(/^.*(?:\[K)?\r(?!$)/gm, '');

    // http://asciiAjaxterm-table.com/ansi-escape-sequences.php
    // could also contain 1 for bold
    string = string.replace(/\[31m/g, '<span class="red">')
                   .replace(/\[32m/g, '<span class="green">')
                   .replace(/\[33m/g, '<span class="yellow">')
                   .replace(/\[34m/g, '<span class="blue">')
                   .replace(/\[35m/g, '<span class="magenta">')
                   .replace(/\[36m/g, '<span class="cyan">')
                   .replace(/\[0?m(?:\(B)?/gm, '</span>');

    return string;
  },
  foldLog: function(string) {
    string = Utils.unfoldLog(string);
    var folds = [
      /(^|<\/div>)(\$ git clone.*\r?\n(?:(Initialized|remote:|Receiving|Resolving).*?\r?\n)*)/m,
      /(^|<\/div>)(\$ git clean.*\r?\n(?:Removing .*\r?\n)+\r?\n*)/m,
      /(^|<\/div>)(\$ git fetch.*\r?\nFrom .*\n.*)\r?\n/m,
      /(^|<\/div>)(\$ bundle install.*\r?\n(?:(Fetching|Updating|Using|Installing|remote:|Receiving|Resolving).*?\r?\n)*)/m,
      /(^|<\/div>)(\$ rake db:migrate[\s\S]*(?:^== +\w+: migrated \(.*\) =+\r?\n))\r?\n?/m,
      /(^|<\/div>)(\/home\/travis\/.rvm\/rubies\/.{140}.*)\r?\n/m
    ];
    _.each(folds, function(fold) {
      string = string.replace(fold, function() { return arguments[1] + '<div class="fold">' + arguments[2].trim() + '</div>'; });
    });
    string = string.replace(/([\.-_*SEF]{120})\n?/g, '$1\n')
    return string;
  },
  unfoldLog: function(string) {
    return string.replace(/<div class="fold">([\s\S]*?)<\/div>/mg, '$1\n');
  },
  updateTimes: function(element) {
    $('.timeago', element).timeago();
    $('.duration', element).readableTime();

    if(!Utils._updateTimesInterval) {
      Utils._updateTimesInterval = setInterval(function() { Utils.updateTimes() }, 3000);
    }
  },
  readableTime: function(duration) {
    var days    = Math.floor(duration / 86400)
    var hours   = Math.floor(duration % 86400 / 3600);
    var minutes = Math.floor(duration % 3600 / 60);
    var seconds = duration % 60;

    if(days > 0) {
      return 'more than 24 hrs';
    } else {
      var result = [];
      if(hours   > 0) { result.push(hours + ' hrs'); }
      if(minutes > 0) { result.push(minutes + ' min'); }
      if(seconds > 0) { result.push(seconds + ' sec'); }
      return result.length > 0 ? result.join(' ') : '-';
    }
  },
  updateGithubStats: function(repository, element) {
    if(!window.__TESTING__) {
      $.getJSON('http://github.com/api/v2/json/repos/show/' + repository.get('slug') + '?callback=?', function(data) {
        var url = 'http://github.com/' + repository.get('slug');
        element.find('.watchers').attr('href', url + '/watchers').text(data.repository.watchers);
        element.find('.forks').attr('href', url + '/network').text(data.repository.forks);
      });
    }
  }
}

function trace() {
  try {
    i.dont.exist; // force an exception
  } catch(e) {
    var lines = e.stack.split('\n').slice(2);
    var stack = _.map(lines, function(line) { return line.replace(/^\s*at/, ''); });
    console.log('trace -------------------------------');
    _.each(stack, function(line) { console.log(line); });
  }
}

