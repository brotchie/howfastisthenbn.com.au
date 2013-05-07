(function($){
  function MBToSize(x) {
    if (x < 1024) {
      return Math.floor(x*10)/10 + ' MB';
    } else {
      x /= 1024;
      return Math.floor(x*100)/100 + ' GB';
    }
  }
  function SecondsToTimeRemaining(s, short) {
    s = Math.floor(s);
    if (s <= 60) {
      return s + ' seconds';
    } else {
      if (short) {
        return Math.floor(s/60) + ':' + (s % 60 < 10 ? '0' : '') + (s % 60);
      } else {
        return Math.floor(s/60) + 'minutes ' + (s % 60) + ' seconds';
      }
    }
  }

  $.downloads = function(root){
    var getAttr = function(name){
      return function(i, x){
        return $(x).attr(name);
      };
    };
    var attrSelector = function(s){
      var selector = "";
      _.map(s, function(v, k){
        selector += '[' + k + '="' + v + '"]';
      });
      return selector;
    };
    var roleSelector = function(c, role){
      return attrSelector({
        'data-download-case' : c,
        'data-download-role' : role
      });
    };
    var cases = $.unique(root.find('[data-download-case]')
                             .map(getAttr('data-download-case')));
    cases.map(function(i, c){
      var button = $(root).find(roleSelector(c, 'download'));
      var triggered = false;
      button.click(function(){
        if (!triggered) {
          triggered = true;
          $(this).trigger('start.downloads');
          $(this).addClass('disabled');
          $(this).text($(this).attr('data-download-disabled-text'));

          /* Google Analytics */
          ga('send', 'event', 'button', 'click', c);
        }
        return false;
      });

      var progress = $(root).find(roleSelector(c, 'progress'));
      progress.map(function(i, x){
        button.on('start.downloads', function(){
          var rate = $(x).attr('data-download-rate') / 8;
          var size = button.attr('data-download-size');
          var duration = size / rate;
          $(x).parent().addClass('active');
          $(x).animate({'width':'100%'}, 
                       duration * 1000,
                       'linear',
                       function(){
                         $(x).parent().removeClass('active');  
                       });
        });
      });

      var textProgress = $(root).find(roleSelector(c, 'text-progress'));
      textProgress.map(function(i, x){
        button.on('start.downloads', function(){
          var rate = $(x).attr('data-download-rate') / 8;
          var size = button.attr('data-download-size');
          var duration = size / rate;
          var startTime = Date.now();
          var updateProgress = function(){
            var elapsed = (Date.now() - startTime)/1000.0;
            var completed = (elapsed / duration) * size;
            if (elapsed < duration) {
              var text = MBToSize(completed);
              text += ' of ' + MBToSize(size);
              text += ', ' + SecondsToTimeRemaining(duration - elapsed, true) + ' remaining';
              $(x).text(text);
            } else {
              var text = MBToSize(size) + ' complete in ' + SecondsToTimeRemaining(duration, false);
              $(x).text(text);
              clearInterval(id);
            }
          };
          var id = setInterval(updateProgress, 1000);
          updateProgress();
        });
      });

      var textComplete = $(root).find(roleSelector(c, 'text-complete'));
      textComplete.map(function(i, x){
        button.on('start.downloads', function(){
          var rate = $(x).attr('data-download-rate') / 8;
          var size = button.attr('data-download-size');
          var duration = size / rate;
          var startedText = $(x).attr('data-download-started-text');
          var completeText = $(x).attr('data-download-complete-text');

          $(x).text(startedText);
          setTimeout(function(){
            $(x).text(completeText);
          }, duration*1000);
        });
      });

      var dropboxProgress = $(root).find(roleSelector(c, 'dropbox-progress'));
      dropboxProgress.map(function(i, x){
        button.on('start.downloads', function(){
          var rate = $(x).attr('data-download-rate') / 8;
          var size = button.attr('data-download-size');
          var duration = size / rate;

          $(x).find('.dropbox-idle-state').addClass('hidden');
          $(x).find('.dropbox-sync1-state').removeClass('hidden');

          var startTime = Date.now();
          setInterval(function(){
            var elapsed = (Date.now() - startTime)/1000.0;
            if (elapsed < duration) {
              $(x).find('.dropbox-progress').removeClass('hidden');
              $(x).find('.dropbox-progress div').text('Syncing (2 files, ' + SecondsToTimeRemaining(duration - elapsed, false) + ' remaining)');
              if(Math.round(elapsed) % 2 == 0) {
                $(x).find('.dropbox-sync1-state').removeClass('hidden');
                $(x).find('.dropbox-sync2-state').addClass('hidden');
              } else {
                $(x).find('.dropbox-sync1-state').addClass('hidden');
                $(x).find('.dropbox-sync2-state').removeClass('hidden');
              }
            } else {
              $(x).find('.dropbox-progress div').text('Up to Date.');
              $(x).find('.dropbox-sync1-state').addClass('hidden');
              $(x).find('.dropbox-sync2-state').addClass('hidden');
              $(x).find('.dropbox-ok-state').removeClass('hidden');
              clearInterval(id);
            }
          }, 1000);
        });
      });
    });
  };
})(jQuery);
