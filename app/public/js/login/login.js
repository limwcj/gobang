if (!window.lm) window.lm = {};
(function () {
  var timer = null;
  window.lm.login =  {
    default: {
      loginBtn: '',
      loginUrl: '/user/login',
      registerUrl: '/user/register',
      cookieName: 'lm',
      cookieValidSeconds: 24 * 3600,
      loginCallback: function () {},
      registerCallback: function () {},
    },
    init: function (options) {
      var opts = $.extend({}, this.default, options);
      var $loginBtn = $("#" + opts.loginBtn);
      if (!($loginBtn instanceof jQuery)) throw new Error('loginBtn is necessary');
      if (!$loginBtn.length) {
        $(`<div id="${opts.loginBtn}" style="display: none;">`).appendTo('body');
      }
      $("#" + opts.loginBtn).on('click', function () {
        if (getCookie(opts.cookieName)) {
          opts.loginCallback();
        } else {
          $('#mask,#login-wrap,#register-wrap').remove();
          buildLoginHtml();
          $('#login-wrap').show();
          $('#login-loginname input').focus();
          $('#mask').show();
          $('body').css('overflowY', 'hidden');
          $('.login-tip').css('visibility', 'hidden');
        }
        $('.login-body input').on('focus', function () {
          $('.login-body div').css('border', '1px solid #e0e0e0');
          $(this).parent().css('border', '1px solid #009933');
        }).on('blur', function () {
          $('.login-body div').css('border', '1px solid #e0e0e0');
        });
        $('.btn-clear').on('click', function () {
          $(this).parent().find('input').val('').focus();
        });
        $('.btn-loginclose, #mask').on('click', function () {
          closeLoginDialog();
        });
        $('#register').on('click', function () {
          $('#login-wrap').hide();
          $('#register-wrap').show();
          $('#register-loginname input').focus();
          $('.login-tip').css('visibility', 'hidden');
        });
        $('#backtologin').on('click', function () {
          $('#login-wrap').show();
          $('#register-wrap').hide();
          $('#login-loginname input').focus();
          $('.login-tip').css('visibility', 'hidden');
        });
        $('#login-loginname input, #login-password input').on('keydown', function (e) {
          if (e.keyCode == 13) {
            $('#btn-loginsubmit').click();
          }
        });
        $('#register-loginname input, #register-password input, #register-password-again input').on('keydown', function (e) {
          if (e.keyCode == 13) {
            $('#btn-registersubmit').click();
          }
        });
        $('#btn-loginsubmit').on('click', function () {
          var loginName = $.trim($('#login-loginname input').val()),
            password = $.trim($('#login-password input').val());
          var params = {
            username: loginName,
            password: password
          };
          if (!loginName) {
            showError('用户名不能为空！');
            return false;
          }
          if (!password) {
            showError('密码不能为空！');
            return false;
          }
          login(params);
        });
        $('#btn-registersubmit').on('click', function () {
          var loginName = $.trim($('#register-loginname input').val()),
            password = $('#register-password input').val(),
            passwordAgain = $('#register-password-again input').val();
          if (!loginName) {
            showError('用户名不能为空！');
            return false;
          }
          if (password.length < 6) {
            showError('密码长度不正确！大于等于6');
            return false;
          }
          if (password != passwordAgain) {
            showError('两次输入密码不一致！');
            return false;
          }
          var params = {
            username: loginName,
            password: password
          };
          $.ajax({
            url: opts.registerUrl,
            type: 'post',
            data: params,
            dataType: 'json',
            success: function (data) {
              if (data.code == 0) {
                opts.registerCallback();
              } else {
                showError(data.message);
              }
            }
          });
        });
      });

      function closeLoginDialog() {
        $('#login-wrap, #register-wrap').hide().find('input').val('');
        $('#mask').hide();
        $('body').css('overflowY', 'auto');
      }

      function login(params) {
        $.ajax({
          url: opts.loginUrl,
          type: 'post',
          data: params,
          dataType: 'json',
          success: function (data) {
            if (data.code == 0) {
              opts.loginCallback();
            } else {
              showError(data.message);
            }
          }
        });
      }

      function buildLoginHtml() {
        $(`<div id="mask"></div>
          <div id="login-wrap">
              <div class="login-header">
                  <img src="./js/login/lm_logo.png"/>
                  <span class="login-header-title">账号登录</span>
                  <span class="btn-loginclose">×</span>
              </div>
              <div class="login-tip">登录失败</div>
              <div class="login-body">
                  <div id="login-loginname">
                      <span class="icon-login icon-loginname"></span>
                      <input type="text" placeholder="用户名" maxlength="40"/>
                      <span class="btn-clear">×</span>
                  </div>
                  <div id="login-password">
                      <span class="icon-login icon-password"></span>
                      <input type="password" placeholder="密码" maxlength="40"/>
                      <span class="btn-clear">×</span>
                  </div>
                  <span id="btn-loginsubmit">登&nbsp;录</span>
              </div>
              <div class="login-footer">
                  <div id="register">注册</div>
              </div>
          </div>
          <div id="register-wrap">
              <div class="login-header">
                  <img src="./js/login/lm_logo.png"/>
                  <span class="login-header-title">快速注册</span>
                  <span class="btn-loginclose">×</span>
              </div>
              <div class="login-tip">注册失败</div>
              <div class="login-body">
                  <div id="register-loginname">
                      <span class="icon-login icon-loginname"></span>
                      <input type="text" placeholder="请输入用户名" maxlength="40"/>
                      <span class="btn-clear">×</span>
                  </div>
                  <div id="register-password">
                      <span class="icon-login icon-password"></span>
                      <input type="password" placeholder="密码，长度必须大于6个字符" maxlength="40"/>
                      <span class="btn-clear">×</span>
                  </div>
                  <div id="register-password-again">
                      <span class="icon-login icon-password"></span>
                      <input type="password" placeholder="再次输入密码" maxlength="40"/>
                      <span class="btn-clear">×</span>
                  </div>
                  <span id="btn-registersubmit">注&nbsp;册</span>
              </div>
              <div class="login-footer">
                  <div id="backtologin">登录</div>
              </div>
          </div>`).appendTo('body');
      }

      function showError(err) {
        var $loginErr = $('.login-tip');
        clearTimeout(timer);
        $loginErr.html(err).css('visibility', 'visible');
        timer = setTimeout(function () {
          $loginErr.html('error').css('visibility', 'hidden');
        }, 3000);
      }

      function getCookie(name) {
        var arr, reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
        if (arr = document.cookie.match(reg))
          return unescape(arr[2]);
        else
          return null;
      }
    }
  };
})();