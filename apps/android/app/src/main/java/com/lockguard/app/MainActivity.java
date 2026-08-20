package com.lockguard.app;

import android.app.Activity;
import android.app.AlertDialog;
import android.app.KeyguardManager;
import android.content.Context;
import android.content.SharedPreferences;
import android.graphics.Color;
import android.hardware.fingerprint.FingerprintManager;
import android.os.Build;
import android.os.Bundle;
import android.os.CancellationSignal;
import android.view.Gravity;
import android.view.View;
import android.webkit.CookieManager;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

public class MainActivity extends Activity {
    private static final String VERSION = "0.0.2";
    private static final String URL = "https://lockguardapp.vercel.app";
    private static final String PREFS = "lockguard_android";
    private static final String PREF_BIOMETRIC = "biometric_enabled";
    private static final int GOLD = Color.rgb(212,175,55);
    private static final int GOLD2 = Color.rgb(241,216,121);
    private static final int BG = Color.rgb(5,5,5);
    private static final int PANEL = Color.rgb(15,15,15);

    private SharedPreferences prefs;
    private WebView web;
    private LinearLayout root;
    private CancellationSignal fingerprintCancellation;
    private boolean webLoaded = false;

    @Override
    protected void onCreate(Bundle state) {
        super.onCreate(state);
        getWindow().setStatusBarColor(BG);
        getWindow().setNavigationBarColor(BG);
        prefs = getSharedPreferences(PREFS, MODE_PRIVATE);
        if (prefs.getBoolean(PREF_BIOMETRIC, false)) {
            showBiometricGate();
        } else {
            showApp();
        }
    }

    private int dp(int value) {
        return (int) (value * getResources().getDisplayMetrics().density + .5f);
    }

    private TextView text(String value, int sp, int color) {
        TextView t = new TextView(this);
        t.setText(value);
        t.setTextSize(sp);
        t.setTextColor(color);
        return t;
    }

    private Button button(String label) {
        Button b = new Button(this);
        b.setText(label);
        b.setAllCaps(false);
        b.setTextColor(Color.BLACK);
        b.setBackgroundColor(GOLD);
        return b;
    }

    private void showBiometricGate() {
        LinearLayout gate = new LinearLayout(this);
        gate.setOrientation(LinearLayout.VERTICAL);
        gate.setGravity(Gravity.CENTER);
        gate.setPadding(dp(28), dp(30), dp(28), dp(30));
        gate.setBackgroundColor(BG);

        TextView lock = text("🔒", 52, GOLD);
        lock.setGravity(Gravity.CENTER);
        gate.addView(lock, new LinearLayout.LayoutParams(-1, -2));

        TextView brand = text("LOCKGUARD", 27, GOLD2);
        brand.setGravity(Gravity.CENTER);
        brand.setLetterSpacing(.12f);
        brand.setPadding(0, dp(10), 0, dp(6));
        gate.addView(brand, new LinearLayout.LayoutParams(-1, -2));

        TextView subtitle = text("DESBLOQUEIO BIOMÉTRICO", 12, Color.LTGRAY);
        subtitle.setGravity(Gravity.CENTER);
        gate.addView(subtitle, new LinearLayout.LayoutParams(-1, -2));

        Button biometric = button("USAR IMPRESSÃO DIGITAL");
        LinearLayout.LayoutParams bp = new LinearLayout.LayoutParams(-1, dp(52));
        bp.topMargin = dp(28);
        gate.addView(biometric, bp);

        Button password = button("ENTRAR COM LOGIN E SENHA");
        password.setTextColor(GOLD2);
        password.setBackgroundColor(PANEL);
        LinearLayout.LayoutParams pp = new LinearLayout.LayoutParams(-1, dp(52));
        pp.topMargin = dp(10);
        gate.addView(password, pp);

        TextView version = text("Android • Versão " + VERSION, 10, Color.DKGRAY);
        version.setGravity(Gravity.CENTER);
        version.setPadding(0, dp(26), 0, 0);
        gate.addView(version, new LinearLayout.LayoutParams(-1, -2));

        biometric.setOnClickListener(v -> promptBiometric(() -> showApp(), false));
        password.setOnClickListener(v -> showApp());
        setContentView(gate);

        gate.postDelayed(() -> promptBiometric(() -> showApp(), false), 250);
    }

    private void showApp() {
        root = new LinearLayout(this);
        root.setOrientation(LinearLayout.VERTICAL);
        root.setBackgroundColor(BG);

        LinearLayout header = new LinearLayout(this);
        header.setGravity(Gravity.CENTER_VERTICAL);
        header.setPadding(dp(14), dp(8), dp(10), dp(8));
        header.setBackgroundColor(Color.rgb(8,8,8));

        TextView icon = text("🔒", 21, GOLD);
        header.addView(icon, new LinearLayout.LayoutParams(dp(34), -2));

        TextView title = text("LOCKGUARD", 17, GOLD2);
        title.setLetterSpacing(.1f);
        header.addView(title, new LinearLayout.LayoutParams(0, -2, 1));

        TextView ver = text("v" + VERSION, 10, Color.GRAY);
        ver.setPadding(dp(4), 0, dp(10), 0);
        header.addView(ver, new LinearLayout.LayoutParams(-2, -2));

        Button bio = new Button(this);
        bio.setText("◎");
        bio.setTextSize(18);
        bio.setTextColor(GOLD2);
        bio.setBackgroundColor(Color.TRANSPARENT);
        bio.setContentDescription("Biometria");
        header.addView(bio, new LinearLayout.LayoutParams(dp(46), dp(42)));
        root.addView(header, new LinearLayout.LayoutParams(-1, -2));

        web = new WebView(this);
        web.setBackgroundColor(BG);
        WebSettings s = web.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setLoadsImagesAutomatically(true);
        s.setUseWideViewPort(false);
        s.setLoadWithOverviewMode(false);
        s.setBuiltInZoomControls(false);
        s.setDisplayZoomControls(false);
        s.setMediaPlaybackRequiresUserGesture(true);
        s.setUserAgentString(s.getUserAgentString() + " LockGuardAndroid/" + VERSION);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) s.setSafeBrowsingEnabled(true);

        CookieManager.getInstance().setAcceptCookie(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(web, false);
        WebView.setWebContentsDebuggingEnabled(false);

        web.setWebChromeClient(new WebChromeClient());
        web.setWebViewClient(new WebViewClient() {
            @Override
            public void onPageFinished(WebView view, String url) {
                webLoaded = true;
                injectMobileEnhancements();
            }
        });

        root.addView(web, new LinearLayout.LayoutParams(-1, 0, 1));
        setContentView(root);
        web.loadUrl(URL);

        bio.setOnClickListener(v -> {
            boolean enabled = prefs.getBoolean(PREF_BIOMETRIC, false);
            if (enabled) {
                promptBiometric(() -> {
                    prefs.edit().putBoolean(PREF_BIOMETRIC, false).apply();
                    toast("Entrada por biometria desativada");
                }, true);
            } else {
                promptBiometric(() -> {
                    prefs.edit().putBoolean(PREF_BIOMETRIC, true).apply();
                    toast("Entrada por biometria ativada");
                }, true);
            }
        });
    }

    private void injectMobileEnhancements() {
        if (web == null) return;
        String js = "(function(){" +
            "try{" +
            "var st=document.createElement('style');" +
            "st.textContent='html,body{overscroll-behavior:none} body{padding-bottom:18px!important} button,input,select,textarea{min-height:42px} @media(max-width:700px){.wrap,.shell,.container{max-width:100%!important;width:100%!important}.main{padding-left:10px!important;padding-right:10px!important}}';" +
            "document.head.appendChild(st);" +
            "var f=document.querySelectorAll('*');for(var i=0;i<f.length;i++){if(f[i].childNodes.length===1&&f[i].childNodes[0].nodeType===3&&f[i].textContent.trim()==='Versão 0.7.03'){f[i].textContent='Web Engine 0.7.03';}}" +
            "var session=localStorage.getItem('lockguard.auth.v1');" +
            "if(!session&&typeof authOpen==='function'){setTimeout(function(){authOpen('login');},200);}" +
            "}catch(e){}" +
            "})();";
        web.evaluateJavascript(js, null);
    }

    private void promptBiometric(Runnable success, boolean configuring) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            android.hardware.biometrics.BiometricPrompt prompt = new android.hardware.biometrics.BiometricPrompt.Builder(this)
                    .setTitle(configuring ? "Configurar biometria" : "Desbloquear LockGuard")
                    .setSubtitle("Confirme sua identidade")
                    .setNegativeButton("Cancelar", getMainExecutor(), (dialog, which) -> {})
                    .build();
            prompt.authenticate(new CancellationSignal(), getMainExecutor(), new android.hardware.biometrics.BiometricPrompt.AuthenticationCallback() {
                @Override public void onAuthenticationSucceeded(android.hardware.biometrics.BiometricPrompt.AuthenticationResult result) { success.run(); }
                @Override public void onAuthenticationError(int errorCode, CharSequence errString) {
                    if (configuring) toast(errString.toString());
                }
            });
            return;
        }

        FingerprintManager fm = (FingerprintManager) getSystemService(Context.FINGERPRINT_SERVICE);
        if (fm != null && fm.isHardwareDetected() && fm.hasEnrolledFingerprints()) {
            fingerprintCancellation = new CancellationSignal();
            fm.authenticate(null, fingerprintCancellation, 0, new FingerprintManager.AuthenticationCallback() {
                @Override public void onAuthenticationSucceeded(FingerprintManager.AuthenticationResult result) { runOnUiThread(success); }
                @Override public void onAuthenticationFailed() { runOnUiThread(() -> toast("Impressão digital não reconhecida")); }
                @Override public void onAuthenticationError(int code, CharSequence message) {
                    if (configuring) runOnUiThread(() -> toast(message.toString()));
                }
            }, null);
            return;
        }

        KeyguardManager km = (KeyguardManager) getSystemService(KEYGUARD_SERVICE);
        if (km != null && km.isKeyguardSecure()) {
            new AlertDialog.Builder(this)
                    .setTitle("Biometria indisponível")
                    .setMessage("Este aparelho não disponibilizou impressão digital para o LockGuard. Você pode continuar usando login, senha e senha mestra normalmente.")
                    .setPositiveButton("OK", null)
                    .show();
        } else {
            toast("Biometria não configurada neste aparelho");
        }
    }

    private void toast(String text) {
        Toast.makeText(this, text, Toast.LENGTH_SHORT).show();
    }

    @Override
    public void onBackPressed() {
        if (web != null && web.canGoBack()) web.goBack(); else super.onBackPressed();
    }

    @Override
    protected void onDestroy() {
        if (fingerprintCancellation != null) fingerprintCancellation.cancel();
        if (web != null) {
            web.stopLoading();
            web.removeAllViews();
            web.destroy();
        }
        super.onDestroy();
    }
}
