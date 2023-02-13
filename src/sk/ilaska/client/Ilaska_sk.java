package sk.ilaska.client;

import com.google.gwt.core.client.EntryPoint;
import com.google.gwt.user.client.ui.RootPanel;
import com.googlecode.gwt.crypto.bouncycastle.digests.SHA1Digest;
import com.smartgwt.client.types.Alignment;
import com.smartgwt.client.util.SC;
import com.smartgwt.client.widgets.Button;
import com.smartgwt.client.widgets.Canvas;
import com.smartgwt.client.widgets.HTMLPane;
import com.smartgwt.client.widgets.Label;
import com.smartgwt.client.widgets.events.ClickEvent;
import com.smartgwt.client.widgets.events.ClickHandler;
import com.smartgwt.client.widgets.form.DynamicForm;
import com.smartgwt.client.widgets.form.fields.TextItem;
import com.smartgwt.client.widgets.layout.VLayout;

/**
 * Entry point classes define <code>onModuleLoad()</code>.
 */
public class Ilaska_sk implements EntryPoint {
	
	/**
	 * This is the entry point method.
	 */
	public void onModuleLoad() {
		// Use RootPanel.get() to get the entire body element
		
		TextItem emailTI = new TextItem("Email");
		TextItem nameTI = new TextItem("Meno");
		DynamicForm df = new DynamicForm();
		Button proceed = new Button("Pokracuj");
		df.setFields(emailTI, nameTI);
		
		Label content = new Label();
		
		VLayout vl = new VLayout();
		proceed.setAlign(Alignment.CENTER);
		
		
		proceed.addClickHandler(new ClickHandler() {
			
			@Override
			public void onClick(ClickEvent event) {
				if (emailTI.getValueAsString() != null && nameTI.getValueAsString() != null) {
					String str = emailTI.getValueAsString()+nameTI.getValueAsString();
					String hash = getSHA1for(str);
					//SC.say(hash);
					vl.removeChild(proceed);
					vl.removeChild(df);
					content.setContents("<iframe src=\"template/?p="+hash+"\" width=\"800\" height=\"530\" />");
				} else
				{
					SC.say("Email a Meno musia byt vyplnene!");
				}
				
				
			}
		});
		
		
		
		
		
		vl.addMember(df);
		vl.addMember(proceed);
		vl.addMember(content);
		
		
		
		RootPanel.get("root").add(vl);
		
	}
	
	public static String getSHA1for(String text)
	{
		SHA1Digest sd = new SHA1Digest();
		byte[] bs = text.getBytes();
		sd.update(bs, 0, bs.length);
		byte[] result = new byte[20];
		sd.doFinal(result, 0);
		return byteArrayToHexString(result);
	}
	
	private static String byteArrayToHexString(final byte[] b)
	{
		final StringBuffer sb = new StringBuffer(b.length * 2);
		for (int i = 0, len = b.length; i < len; i++)
		{
			int v = b[i] & 0xff;
			if (v < 16)
				sb.append('0');
			sb.append(Integer.toHexString(v));
		}
		return sb.toString();
	}
}
