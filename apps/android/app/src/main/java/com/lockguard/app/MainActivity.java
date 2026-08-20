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
import android.view.WindowInsets;
import android.webkit.CookieManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.LinearLayout;
import android.widget.TextView;
import android.widget.Toast;

public class MainActivity extends Activity {
    private static final String VERSION = "0.0.4";
    private static final String WEB_VERSION = "0.7.4";
    private static final String URL = "https://lockguardapp.vercel.app";
    private static final String PREFS = "lockguard_android";
    private static final String PREF_BIOMETRIC = "biometric_enabled";
    private static final String PREF_BIOMETRIC_OFFERED = "biometric_offered";
    private static final int GOLD = Color.rgb(212,175,55);
    private static final int GOLD2 = Color.rgb(241,216,121);
    private static final int BG = Color.rgb(5,5,5);
    private static final int PANEL = Color.rgb(15,15,15);
    private SharedPreferences prefs;
    private WebView web;
    private CancellationSignal fingerprintCancellation;
    private boolean biometricPromptActive=false;
    private boolean requiresUnlock=false;
    private boolean forceWebLogin=false;

    @Override protected void onCreate(Bundle state){
        super.onCreate(state);getWindow().setStatusBarColor(BG);getWindow().setNavigationBarColor(BG);
        prefs=getSharedPreferences(PREFS,MODE_PRIVATE);
        if(prefs.getBoolean(PREF_BIOMETRIC,false)){requiresUnlock=true;showBiometricGate();}else showApp(false);
    }
    private int dp(int v){return(int)(v*getResources().getDisplayMetrics().density+.5f);}
    private void applySafeInsets(View view){
        final int l=view.getPaddingLeft(),t=view.getPaddingTop(),r=view.getPaddingRight(),b=view.getPaddingBottom();
        view.setOnApplyWindowInsetsListener((v,i)->{int it,ib,il,ir;if(Build.VERSION.SDK_INT>=Build.VERSION_CODES.R){android.graphics.Insets x=i.getInsets(WindowInsets.Type.systemBars());it=x.top;ib=x.bottom;il=x.left;ir=x.right;}else{it=i.getSystemWindowInsetTop();ib=i.getSystemWindowInsetBottom();il=i.getSystemWindowInsetLeft();ir=i.getSystemWindowInsetRight();}v.setPadding(l+il,t+it,r+ir,b+ib);return i;});view.requestApplyInsets();
    }
    private TextView text(String value,int sp,int color){TextView x=new TextView(this);x.setText(value);x.setTextSize(sp);x.setTextColor(color);return x;}
    private Button button(String label){Button x=new Button(this);x.setText(label);x.setAllCaps(false);x.setTextColor(Color.BLACK);x.setBackgroundColor(GOLD);return x;}

    private void showBiometricGate(){
        LinearLayout gate=new LinearLayout(this);gate.setOrientation(LinearLayout.VERTICAL);gate.setGravity(Gravity.CENTER);gate.setPadding(dp(28),dp(30),dp(28),dp(30));gate.setBackgroundColor(BG);applySafeInsets(gate);
        TextView lock=text("🔒",52,GOLD);lock.setGravity(Gravity.CENTER);gate.addView(lock,new LinearLayout.LayoutParams(-1,-2));
        TextView brand=text("LOCKGUARD",27,GOLD2);brand.setGravity(Gravity.CENTER);brand.setLetterSpacing(.12f);brand.setPadding(0,dp(10),0,dp(6));gate.addView(brand,new LinearLayout.LayoutParams(-1,-2));
        TextView subtitle=text("DESBLOQUEIO BIOMÉTRICO",12,Color.LTGRAY);subtitle.setGravity(Gravity.CENTER);gate.addView(subtitle,new LinearLayout.LayoutParams(-1,-2));
        Button biometric=button("USAR IMPRESSÃO DIGITAL");LinearLayout.LayoutParams bp=new LinearLayout.LayoutParams(-1,dp(52));bp.topMargin=dp(28);gate.addView(biometric,bp);
        Button password=button("ENTRAR COM LOGIN E SENHA");password.setTextColor(GOLD2);password.setBackgroundColor(PANEL);LinearLayout.LayoutParams pp=new LinearLayout.LayoutParams(-1,dp(52));pp.topMargin=dp(10);gate.addView(password,pp);
        TextView version=text("Android • Versão "+VERSION,10,Color.DKGRAY);version.setGravity(Gravity.CENTER);version.setPadding(0,dp(26),0,0);gate.addView(version,new LinearLayout.LayoutParams(-1,-2));
        biometric.setOnClickListener(v->promptBiometric(()->{requiresUnlock=false;showApp(false);},false));
        password.setOnClickListener(v->{requiresUnlock=false;showApp(true);});setContentView(gate);
        gate.postDelayed(()->{if(!biometricPromptActive&&requiresUnlock)promptBiometric(()->{requiresUnlock=false;showApp(false);},false);},250);
    }

    private void showApp(boolean forceLogin){
        forceWebLogin=forceLogin;LinearLayout root=new LinearLayout(this);root.setOrientation(LinearLayout.VERTICAL);root.setBackgroundColor(BG);applySafeInsets(root);
        LinearLayout header=new LinearLayout(this);header.setGravity(Gravity.CENTER_VERTICAL);header.setPadding(dp(14),dp(8),dp(10),dp(8));header.setBackgroundColor(Color.rgb(8,8,8));
        TextView icon=text("🔒",21,GOLD);header.addView(icon,new LinearLayout.LayoutParams(dp(34),-2));TextView title=text("LOCKGUARD",17,GOLD2);title.setLetterSpacing(.1f);header.addView(title,new LinearLayout.LayoutParams(0,-2,1));TextView ver=text("v"+VERSION,10,Color.GRAY);ver.setPadding(dp(4),0,dp(6),0);header.addView(ver,new LinearLayout.LayoutParams(-2,-2));
        Button bio=new Button(this);bio.setText("◎");bio.setTextSize(18);bio.setTextColor(GOLD2);bio.setBackgroundColor(Color.TRANSPARENT);bio.setContentDescription("Configurar biometria");header.addView(bio,new LinearLayout.LayoutParams(dp(46),dp(42)));root.addView(header,new LinearLayout.LayoutParams(-1,-2));
        web=new WebView(this);web.setBackgroundColor(BG);web.addJavascriptInterface(new AndroidBridge(),"LockGuardAndroid");WebSettings s=web.getSettings();s.setJavaScriptEnabled(true);s.setDomStorageEnabled(true);s.setDatabaseEnabled(true);s.setLoadsImagesAutomatically(true);s.setUseWideViewPort(false);s.setLoadWithOverviewMode(false);s.setBuiltInZoomControls(false);s.setDisplayZoomControls(false);s.setMediaPlaybackRequiresUserGesture(true);s.setUserAgentString(s.getUserAgentString()+" LockGuardAndroid/"+VERSION);if(Build.VERSION.SDK_INT>=Build.VERSION_CODES.O)s.setSafeBrowsingEnabled(true);
        CookieManager.getInstance().setAcceptCookie(true);CookieManager.getInstance().setAcceptThirdPartyCookies(web,false);WebView.setWebContentsDebuggingEnabled(false);web.setWebChromeClient(new WebChromeClient());
        web.setWebViewClient(new WebViewClient(){@Override public void onPageFinished(WebView view,String url){if(forceWebLogin){forceWebLogin=false;web.evaluateJavascript("try{localStorage.removeItem('lockguard.auth.v1');sessionStorage.clear();}catch(e){}",null);web.postDelayed(()->injectMobileEnhancements(),150);}else injectMobileEnhancements();}});
        root.addView(web,new LinearLayout.LayoutParams(-1,0,1));setContentView(root);web.loadUrl(URL);
        bio.setOnClickListener(v->{boolean enabled=prefs.getBoolean(PREF_BIOMETRIC,false);if(enabled){promptBiometric(()->{prefs.edit().putBoolean(PREF_BIOMETRIC,false).apply();requiresUnlock=false;toast("Entrada por biometria desativada");},true);}else{promptBiometric(()->{prefs.edit().putBoolean(PREF_BIOMETRIC,true).putBoolean(PREF_BIOMETRIC_OFFERED,true).apply();requiresUnlock=false;toast("Entrada por biometria ativada");},true);}});
    }

    private void injectMobileEnhancements(){
        if(web==null)return;String js="(function(){try{"+
                "if(!document.getElementById('lockguard-android-style')){var st=document.createElement('style');st.id='lockguard-android-style';st.textContent='html,body{overscroll-behavior:none} body{padding-bottom:18px!important} button,input,select,textarea{min-height:42px} @media(max-width:700px){.wrap,.shell,.container{max-width:100%!important;width:100%!important}.main{padding-left:10px!important;padding-right:10px!important}}';document.head.appendChild(st);}"+
                "var f=document.querySelectorAll('*');for(var j=0;j<f.length;j++){if(f[j].childNodes.length===1&&f[j].childNodes[0].nodeType===3&&f[j].textContent.trim()==='Versão "+WEB_VERSION+"'){f[j].textContent='Web Engine "+WEB_VERSION+"';}}"+
                "var notify=function(){try{if(localStorage.getItem('lockguard.auth.v1')&&window.LockGuardAndroid){window.LockGuardAndroid.onSessionDetected();}}catch(e){}};notify();"+
                "if(!window.__lockguardStorageHook){window.__lockguardStorageHook=true;var old=Storage.prototype.setItem;Storage.prototype.setItem=function(k,v){old.apply(this,arguments);if(k==='lockguard.auth.v1'){setTimeout(notify,50);}};}"+
                "var session=localStorage.getItem('lockguard.auth.v1');if(!session&&typeof authOpen==='function'){setTimeout(function(){authOpen('login');},200);}"+
                "}catch(e){}})();";web.evaluateJavascript(js,null);
    }

    private void offerBiometricAfterLogin(){if(prefs.getBoolean(PREF_BIOMETRIC,false)||prefs.getBoolean(PREF_BIOMETRIC_OFFERED,false)||isFinishing())return;prefs.edit().putBoolean(PREF_BIOMETRIC_OFFERED,true).apply();new AlertDialog.Builder(this).setTitle("Ativar impressão digital?").setMessage("Use sua biometria para proteger o LockGuard sempre que abrir ou voltar ao aplicativo.").setNegativeButton("Agora não",null).setPositiveButton("Ativar",(d,w)->promptBiometric(()->{prefs.edit().putBoolean(PREF_BIOMETRIC,true).apply();requiresUnlock=false;toast("Biometria ativada");},true)).show();}
    private class AndroidBridge{@JavascriptInterface public void onSessionDetected(){runOnUiThread(()->offerBiometricAfterLogin());}}

    private void promptBiometric(Runnable success,boolean configuring){
        if(biometricPromptActive)return;biometricPromptActive=true;
        if(Build.VERSION.SDK_INT>=Build.VERSION_CODES.P){android.hardware.biometrics.BiometricPrompt prompt=new android.hardware.biometrics.BiometricPrompt.Builder(this).setTitle(configuring?"Configurar biometria":"Desbloquear LockGuard").setSubtitle("Confirme sua identidade").setNegativeButton("Cancelar",getMainExecutor(),(d,w)->biometricPromptActive=false).build();prompt.authenticate(new CancellationSignal(),getMainExecutor(),new android.hardware.biometrics.BiometricPrompt.AuthenticationCallback(){@Override public void onAuthenticationSucceeded(android.hardware.biometrics.BiometricPrompt.AuthenticationResult result){biometricPromptActive=false;success.run();}@Override public void onAuthenticationError(int code,CharSequence msg){biometricPromptActive=false;if(configuring)toast(msg.toString());}@Override public void onAuthenticationFailed(){if(configuring)toast("Biometria não reconhecida");}});return;}
        FingerprintManager fm=(FingerprintManager)getSystemService(Context.FINGERPRINT_SERVICE);if(fm!=null&&fm.isHardwareDetected()&&fm.hasEnrolledFingerprints()){fingerprintCancellation=new CancellationSignal();fm.authenticate(null,fingerprintCancellation,0,new FingerprintManager.AuthenticationCallback(){@Override public void onAuthenticationSucceeded(FingerprintManager.AuthenticationResult result){biometricPromptActive=false;runOnUiThread(success);}@Override public void onAuthenticationFailed(){runOnUiThread(()->toast("Impressão digital não reconhecida"));}@Override public void onAuthenticationError(int code,CharSequence msg){biometricPromptActive=false;if(configuring)runOnUiThread(()->toast(msg.toString()));}},null);return;}
        biometricPromptActive=false;KeyguardManager km=(KeyguardManager)getSystemService(KEYGUARD_SERVICE);if(km!=null&&km.isKeyguardSecure())new AlertDialog.Builder(this).setTitle("Biometria indisponível").setMessage("Este aparelho não disponibilizou impressão digital para o LockGuard. Você pode continuar usando login e senha normalmente.").setPositiveButton("OK",null).show();else toast("Biometria não configurada neste aparelho");
    }
    private void toast(String t){Toast.makeText(this,t,Toast.LENGTH_SHORT).show();}
    @Override protected void onResume(){super.onResume();if(prefs!=null&&prefs.getBoolean(PREF_BIOMETRIC,false)&&requiresUnlock&&!biometricPromptActive)showBiometricGate();}
    @Override protected void onStop(){if(prefs!=null&&prefs.getBoolean(PREF_BIOMETRIC,false)&&!biometricPromptActive)requiresUnlock=true;super.onStop();}
    @Override public void onBackPressed(){if(web!=null&&web.canGoBack())web.goBack();else super.onBackPressed();}
    @Override protected void onDestroy(){if(fingerprintCancellation!=null)fingerprintCancellation.cancel();if(web!=null){web.stopLoading();web.removeJavascriptInterface("LockGuardAndroid");web.removeAllViews();web.destroy();}super.onDestroy();}
}
