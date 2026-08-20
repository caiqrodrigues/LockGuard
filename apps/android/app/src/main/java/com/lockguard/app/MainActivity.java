package com.lockguard.app;

import android.app.*;
import android.os.*;
import android.content.*;
import android.graphics.Color;
import android.graphics.Typeface;
import android.text.InputType;
import android.view.*;
import android.widget.*;
import java.io.*;
import java.net.*;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.util.*;
import javax.crypto.*;
import javax.crypto.spec.*;
import org.bouncycastle.crypto.generators.Argon2BytesGenerator;
import org.bouncycastle.crypto.params.Argon2Parameters;
import org.json.*;

public class MainActivity extends Activity {
    static final String SB="https://xyjxznihdnqqcsbtfulh.supabase.co";
    static final String KEY="sb_publishable_ceho4hLIMAczMa46dXDrRA_p_H_Pm7A";
    static final int GOLD=Color.rgb(212,175,55), BG=Color.rgb(5,5,5), PANEL=Color.rgb(13,13,13), MUTED=Color.rgb(150,145,132);
    LinearLayout root,content,tabs; TextView title,version; String token,userId,email; SecretKey vaultKey; JSONObject cloudMeta; JSONArray items=new JSONArray(); JSONObject security=new JSONObject();
    SecureRandom rng=new SecureRandom();

    @Override public void onCreate(Bundle b){super.onCreate(b);getWindow().setStatusBarColor(BG);showShell();showGenerator();}
    @Override protected void onStop(){super.onStop();lockVault(false);}

    TextView tv(String s,int sp,int color){TextView v=new TextView(this);v.setText(s);v.setTextSize(sp);v.setTextColor(color);v.setPadding(dp(8),dp(8),dp(8),dp(8));return v;}
    Button btn(String s){Button b=new Button(this);b.setText(s);b.setTextColor(Color.BLACK);b.setBackgroundColor(GOLD);b.setAllCaps(false);return b;}
    EditText input(String hint){EditText e=new EditText(this);e.setHint(hint);e.setHintTextColor(Color.DKGRAY);e.setTextColor(Color.WHITE);e.setSingleLine(true);e.setBackgroundColor(Color.rgb(20,20,20));e.setPadding(dp(12),dp(10),dp(12),dp(10));return e;}
    int dp(int x){return (int)(x*getResources().getDisplayMetrics().density+.5f);}
    void add(View v){content.addView(v,new LinearLayout.LayoutParams(-1,-2));}
    void gap(int h){Space s=new Space(this);content.addView(s,new LinearLayout.LayoutParams(1,dp(h)));}
    void toast(String s){Toast.makeText(this,s,Toast.LENGTH_SHORT).show();}
    void async(Runnable work,Runnable done){new Thread(()->{try{work.run();runOnUiThread(done);}catch(Exception e){runOnUiThread(()->toast(e.getMessage()==null?"Erro":e.getMessage()));}}).start();}

    void showShell(){root=new LinearLayout(this);root.setOrientation(LinearLayout.VERTICAL);root.setBackgroundColor(BG);setContentView(root);
        LinearLayout head=new LinearLayout(this);head.setPadding(dp(14),dp(12),dp(14),dp(8));head.setGravity(Gravity.CENTER_VERTICAL);
        TextView logo=tv("🔒 LOCKGUARD",20,GOLD);logo.setTypeface(Typeface.DEFAULT_BOLD);head.addView(logo,new LinearLayout.LayoutParams(0,-2,1));
        version=tv("0.7.03",11,MUTED);head.addView(version);root.addView(head);
        tabs=new LinearLayout(this);tabs.setOrientation(LinearLayout.HORIZONTAL);String[] names={"GERADOR","TESTE","COFRE","SECURITY"};
        for(String n:names){Button b=btn(n);b.setTextSize(10);b.setBackgroundColor(Color.rgb(20,20,20));b.setTextColor(GOLD);tabs.addView(b,new LinearLayout.LayoutParams(0,dp(42),1));if(n.equals("GERADOR"))b.setOnClickListener(v->showGenerator());if(n.equals("TESTE"))b.setOnClickListener(v->showTester());if(n.equals("COFRE"))b.setOnClickListener(v->showVault());if(n.equals("SECURITY"))b.setOnClickListener(v->showDashboard());}root.addView(tabs);
        ScrollView scroll=new ScrollView(this);content=new LinearLayout(this);content.setOrientation(LinearLayout.VERTICAL);content.setPadding(dp(14),dp(14),dp(14),dp(24));scroll.addView(content);root.addView(scroll,new LinearLayout.LayoutParams(-1,0,1));}
    void clear(String h,String sub){content.removeAllViews();title=tv(h,23,Color.WHITE);title.setTypeface(Typeface.DEFAULT_BOLD);add(title);add(tv(sub,12,MUTED));gap(10);}

    void showGenerator(){clear("Gerador de senhas","Geração local com SecureRandom. Nada é enviado para o servidor.");EditText ctx=input("Senha para quê? ex.: Gmail");add(ctx);
        LinearLayout opts=new LinearLayout(this);opts.setOrientation(LinearLayout.VERTICAL);CheckBox upper=check("A-Z",true), lower=check("a-z",true), nums=check("0-9",true), syms=check("Símbolos",true);opts.addView(upper);opts.addView(lower);opts.addView(nums);opts.addView(syms);add(opts);
        TextView lenLabel=tv("Comprimento: 20",13,GOLD);add(lenLabel);SeekBar seek=new SeekBar(this);seek.setMax(58);seek.setProgress(14);add(seek);EditText out=input("");out.setFocusable(false);out.setTextSize(16);add(out);TextView score=tv("",13,MUTED);add(score);Button gen=btn("GERAR SENHA");add(gen);Button copy=btn("COPIAR");add(copy);
        Runnable g=()->{int len=seek.getProgress()+6;StringBuilder pool=new StringBuilder();if(upper.isChecked())pool.append("ABCDEFGHIJKLMNOPQRSTUVWXYZ");if(lower.isChecked())pool.append("abcdefghijklmnopqrstuvwxyz");if(nums.isChecked())pool.append("0123456789");if(syms.isChecked())pool.append("!@#$%^&*()-_=+[]{};:,.?");if(pool.length()==0){toast("Ative ao menos um tipo");return;}StringBuilder p=new StringBuilder();for(int i=0;i<len;i++)p.append(pool.charAt(rng.nextInt(pool.length())));out.setText(p.toString());int sc=strength(p.toString(),ctx.getText().toString());score.setText("Força: "+sc+"/100 • "+label(sc));};
        gen.setOnClickListener(v->g.run());seek.setOnSeekBarChangeListener(new SeekBar.OnSeekBarChangeListener(){public void onProgressChanged(SeekBar s,int p,boolean f){lenLabel.setText("Comprimento: "+(p+6));}public void onStartTrackingTouch(SeekBar s){}public void onStopTrackingTouch(SeekBar s){g.run();}});copy.setOnClickListener(v->{((android.content.ClipboardManager)getSystemService(CLIPBOARD_SERVICE)).setPrimaryClip(ClipData.newPlainText("LockGuard",out.getText()));toast("Copiado");});g.run();}
    CheckBox check(String s,boolean on){CheckBox c=new CheckBox(this);c.setText(s);c.setTextColor(Color.WHITE);c.setChecked(on);return c;}

    void showTester(){clear("Teste de força","Análise local da senha digitada.");EditText p=input("Digite uma senha");p.setInputType(InputType.TYPE_CLASS_TEXT|InputType.TYPE_TEXT_VARIATION_PASSWORD);add(p);TextView result=tv("Aguardando",18,GOLD);add(result);TextView detail=tv("",12,MUTED);add(detail);p.addTextChangedListener(new android.text.TextWatcher(){public void beforeTextChanged(CharSequence s,int a,int c,int d){}public void onTextChanged(CharSequence s,int a,int b,int c){int sc=strength(s.toString(),"");result.setText(sc+"/100 • "+label(sc));detail.setText(feedback(s.toString()));}public void afterTextChanged(android.text.Editable e){}});}
    int strength(String p,String context){if(p.length()==0)return 0;int s=Math.min(100,p.length()*5);if(p.length()<10)s-=25;if(!p.matches(".*[A-Z].*"))s-=8;if(!p.matches(".*[a-z].*"))s-=8;if(!p.matches(".*\\d.*"))s-=8;if(!p.matches(".*[^A-Za-z0-9].*"))s-=8;String n=p.toLowerCase(Locale.ROOT);String[] common={"password","senha","admin","qwerty","123456","letmein"};for(String x:common)if(n.contains(x)){s-=25;break;}if(context!=null&&context.length()>2&&n.contains(context.toLowerCase(Locale.ROOT)))s-=15;return Math.max(0,Math.min(100,s));}
    String label(int s){return s<25?"MUITO FRACA":s<45?"FRACA":s<65?"MÉDIA":s<85?"FORTE":"MUITO FORTE";}
    String feedback(String p){List<String> a=new ArrayList<>();if(p.length()<14)a.add("• Prefira 14 caracteres ou mais");if(!p.matches(".*[A-Z].*"))a.add("• Adicione maiúsculas");if(!p.matches(".*\\d.*"))a.add("• Adicione números");if(!p.matches(".*[^A-Za-z0-9].*"))a.add("• Adicione símbolos");if(a.isEmpty())a.add("• Boa composição");return android.text.TextUtils.join("\n",a);}

    void showVault(){clear("Cofre seguro","Mesmo cofre criptografado sincronizado com o LockGuard Web.");if(token==null){showLogin();return;}if(vaultKey==null){showUnlock();return;}renderItems();}
    void showLogin(){EditText em=input("E-mail");EditText pw=input("Senha da conta LockGuard");pw.setInputType(InputType.TYPE_CLASS_TEXT|InputType.TYPE_TEXT_VARIATION_PASSWORD);add(em);add(pw);Button login=btn("ENTRAR");add(login);login.setOnClickListener(v->async(()->{try{JSONObject body=new JSONObject().put("email",em.getText().toString().trim()).put("password",pw.getText().toString());JSONObject r=request("POST",SB+"/auth/v1/token?grant_type=password",body,null);token=r.getString("access_token");JSONObject u=r.getJSONObject("user");userId=u.getString("id");email=u.optString("email");}catch(Exception e){throw new RuntimeException(e.getMessage());}},()->{toast("Conectado");showVault();}));}
    void showUnlock(){EditText m=input("Senha mestra");m.setInputType(InputType.TYPE_CLASS_TEXT|InputType.TYPE_TEXT_VARIATION_PASSWORD);add(m);Button unlock=btn("DESBLOQUEAR COFRE");add(unlock);Button logout=btn("SAIR DA CONTA");logout.setBackgroundColor(Color.DKGRAY);logout.setTextColor(Color.WHITE);add(logout);logout.setOnClickListener(v->{token=null;userId=null;lockVault(false);showVault();});unlock.setOnClickListener(v->async(()->{try{loadAndDecrypt(m.getText().toString());}catch(Exception e){throw new RuntimeException("Não foi possível desbloquear: "+e.getMessage());}},()->{m.setText("");toast("Cofre desbloqueado");showVault();}));}
    void renderItems(){TextView acct=tv("Conta: "+email,11,MUTED);add(acct);LinearLayout bar=new LinearLayout(this);Button sync=btn("SINCRONIZAR");Button lock=btn("BLOQUEAR");lock.setBackgroundColor(Color.DKGRAY);lock.setTextColor(Color.WHITE);bar.addView(sync,new LinearLayout.LayoutParams(0,-2,1));bar.addView(lock,new LinearLayout.LayoutParams(0,-2,1));add(bar);sync.setOnClickListener(v->async(()->{try{loadAndDecrypt(null);}catch(Exception e){throw new RuntimeException(e.getMessage());}},()->{toast("Sincronizado");showVault();}));lock.setOnClickListener(v->{lockVault(true);showVault();});
        add(tv(items.length()+" item(ns)",13,GOLD));for(int i=0;i<items.length();i++){JSONObject x=items.optJSONObject(i);if(x==null)continue;LinearLayout card=new LinearLayout(this);card.setOrientation(LinearLayout.VERTICAL);card.setPadding(dp(10),dp(8),dp(10),dp(8));card.setBackgroundColor(PANEL);TextView n=tv(x.optString("name","Sem nome"),15,Color.WHITE);n.setTypeface(Typeface.DEFAULT_BOLD);card.addView(n);card.addView(tv(x.optString("type","login").toUpperCase(Locale.ROOT),10,GOLD));if("login".equals(x.optString("type","login")))card.addView(tv(x.optString("user","sem usuário"),11,MUTED));content.addView(card,new LinearLayout.LayoutParams(-1,-2));gap(6);} }

    void showDashboard(){clear("Security Dashboard","Análise das credenciais descriptografadas somente neste aparelho.");if(vaultKey==null){add(tv("Cofre bloqueado. Abra e desbloqueie o cofre primeiro.",14,MUTED));Button b=btn("ABRIR COFRE");add(b);b.setOnClickListener(v->showVault());return;}int total=0,strong=0,weak=0,reused=0,exposed=0;Map<String,Integer> map=new HashMap<>();for(int i=0;i<items.length();i++){JSONObject x=items.optJSONObject(i);if(x==null||!"login".equals(x.optString("type","login")))continue;String p=x.optString("password","");if(p.isEmpty())continue;total++;if(strength(p,x.optString("name"))>=65)strong++;else weak++;map.put(p,map.getOrDefault(p,0)+1);if(x.optJSONObject("security")!=null&&x.optJSONObject("security").optInt("exposedCount",0)>0)exposed++;}for(Integer c:map.values())if(c>1)reused+=c;int score=Math.max(0,100-exposed*22-(total==0?0:(weak*25/total))-(total==0?0:(reused*20/total)));TextView big=tv(score+"/100",40,GOLD);big.setTypeface(Typeface.DEFAULT_BOLD);add(big);add(tv("Fortes: "+strong+"   Fracas: "+weak+"   Reutilizadas: "+reused+"   Vazadas: "+exposed,13,Color.WHITE));gap(10);if(exposed>0)add(tv("Troque imediatamente senhas encontradas em vazamentos.",13,Color.RED));if(weak>0)add(tv("Fortaleça as senhas fracas.",13,GOLD));if(reused>0)add(tv("Use uma senha exclusiva para cada serviço.",13,GOLD));if(total>0&&exposed==0&&weak==0&&reused==0)add(tv("Nenhum problema relevante detectado.",13,Color.rgb(110,200,130)));}

    void loadAndDecrypt(String master) throws Exception {JSONArray a=requestArray("GET",SB+"/rest/v1/user_vaults?select=*&user_id=eq."+URLEncoder.encode(userId,"UTF-8"),null,token);if(a.length()==0)throw new Exception("Cofre não encontrado");cloudMeta=a.getJSONObject(0);if(vaultKey==null){if(master==null)throw new Exception("Senha mestra necessária");byte[] salt=Base64.getDecoder().decode(cloudMeta.getString("vault_salt"));String alg=cloudMeta.optString("kdf_algorithm","pbkdf2-sha256");if("argon2id".equals(alg))vaultKey=argon(master,salt,cloudMeta.optInt("kdf_memory_kib",65536),cloudMeta.optInt("kdf_time_cost",3),cloudMeta.optInt("kdf_parallelism",1));else vaultKey=pbkdf2(master,salt,cloudMeta.optInt("kdf_iterations",310000));}
        byte[] iv=Base64.getDecoder().decode(cloudMeta.getString("vault_iv"));byte[] data=Base64.getDecoder().decode(cloudMeta.getString("vault_ciphertext"));Cipher c=Cipher.getInstance("AES/GCM/NoPadding");c.init(Cipher.DECRYPT_MODE,vaultKey,new GCMParameterSpec(128,iv));String plain=new String(c.doFinal(data),StandardCharsets.UTF_8);JSONObject p=new JSONObject(plain);items=p.optJSONArray("items");if(items==null)items=new JSONArray();security=p.optJSONObject("security");if(security==null)security=new JSONObject();}
    SecretKey argon(String master,byte[] salt,int memory,int time,int parallel) throws Exception {Argon2Parameters params=new Argon2Parameters.Builder(Argon2Parameters.ARGON2_id).withSalt(salt).withMemoryAsKB(memory).withIterations(time).withParallelism(parallel).build();Argon2BytesGenerator g=new Argon2BytesGenerator();g.init(params);byte[] out=new byte[32];g.generateBytes(master.toCharArray(),out);return new SecretKeySpec(out,"AES");}
    SecretKey pbkdf2(String master,byte[] salt,int it) throws Exception {PBEKeySpec spec=new PBEKeySpec(master.toCharArray(),salt,it,256);byte[] out=SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256").generateSecret(spec).getEncoded();return new SecretKeySpec(out,"AES");}
    void lockVault(boolean msg){vaultKey=null;items=new JSONArray();security=new JSONObject();cloudMeta=null;if(msg)toast("Cofre bloqueado");}

    JSONObject request(String method,String url,JSONObject body,String bearer) throws Exception {String s=requestRaw(method,url,body==null?null:body.toString(),bearer);return new JSONObject(s);}
    JSONArray requestArray(String method,String url,JSONObject body,String bearer) throws Exception {String s=requestRaw(method,url,body==null?null:body.toString(),bearer);return new JSONArray(s);}
    String requestRaw(String method,String u,String body,String bearer) throws Exception {HttpURLConnection c=(HttpURLConnection)new URL(u).openConnection();c.setRequestMethod(method);c.setConnectTimeout(12000);c.setReadTimeout(15000);c.setRequestProperty("apikey",KEY);c.setRequestProperty("Content-Type","application/json");if(bearer!=null)c.setRequestProperty("Authorization","Bearer "+bearer);if(body!=null){c.setDoOutput(true);try(OutputStream o=c.getOutputStream()){o.write(body.getBytes(StandardCharsets.UTF_8));}}int code=c.getResponseCode();InputStream in=code>=200&&code<300?c.getInputStream():c.getErrorStream();String text;try(BufferedReader r=new BufferedReader(new InputStreamReader(in,StandardCharsets.UTF_8))){StringBuilder b=new StringBuilder();String line;while((line=r.readLine())!=null)b.append(line);text=b.toString();}if(code<200||code>=300)throw new Exception(text.length()>160?text.substring(0,160):text);return text;}
}
