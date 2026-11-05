#!/usr/bin/env python3
"""Render the versioned Instagram delivery-report design from validated JSON."""
import argparse
import json
import math
import sys
from collections import Counter
from datetime import date, datetime
from pathlib import Path
from zoneinfo import ZoneInfo

from PIL import Image
from reportlab.lib.colors import Color, HexColor, white
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfgen import canvas

sys.dont_write_bytecode = True
from check_dataset import check

SKILL = Path(__file__).resolve().parents[1]
MONTHS = ('Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec')
TYPES = ('reel', 'carousel', 'post', 'story')
NAMES = {'reel': 'Reels', 'carousel': 'Carousels', 'post': 'Posts', 'story': 'Stories'}
EXCLUSIVE = {'reach', 'viewers', 'accounts engaged', 'meta accounts reached', 'accounts reached'}


def dated(value):
    d = date.fromisoformat(value[:10])
    return f'{d.day:02d} {MONTHS[d.month-1]} {d.year}'


def number(value):
    if value is None:
        return '-'
    if isinstance(value, (int, float)):
        return f'{value:,.0f}' if float(value).is_integer() else f'{value:,.1f}'
    return str(value)


class Report:
    def __init__(self, data, root, output, fonts=None):
        self.data, self.root = data, root
        self.theme = json.loads((SKILL / 'assets/theme.json').read_text())
        self.w, self.h = self.theme['page_size']
        self.m = self.theme['margin']
        self.width = self.w - 2*self.m
        self.colors = {k: HexColor(v) for k, v in self.theme['colors'].items()}
        self.font = self.theme['font_regular']
        self.bold = self.theme['font_bold']
        if fonts:
            pdfmetrics.registerFont(TTFont('ReportRegular', fonts[0]))
            pdfmetrics.registerFont(TTFont('ReportBold', fonts[1]))
            self.font, self.bold = 'ReportRegular', 'ReportBold'
        self.client = data.get('client_name') or '@'+data['account'].lstrip('@')
        self.agency = data.get('agency_name', 'WordLord Media')
        self.zone = ZoneInfo(data['window']['timezone'])
        self.capture = dated(datetime.fromisoformat(data['captured_at'].replace('Z','+00:00')).astimezone(self.zone).date().isoformat())
        self.window = f"{dated(data['window']['start'])} - {dated(data['window']['end'])}"
        self.items = data['items']
        self.pages = 0
        self.c = canvas.Canvas(str(output), pagesize=(self.w, self.h))
        self.c.setTitle(f'{self.client} | Instagram delivery report | {self.window}')
        self.c.setAuthor(self.agency)
        self.groups = {t: [i for i in self.items if i['type']==t] for t in TYPES}
        self.manifest = []

    def text(self, x, y, value, size=10, color='ink', bold=False, align='left', maxwidth=None):
        value = str(value)
        font = self.bold if bold else self.font
        if maxwidth:
            while pdfmetrics.stringWidth(value, font, size)>maxwidth and size>6:
                size -= .25
        self.c.setFont(font, size)
        self.c.setFillColor(self.colors[color])
        (self.c.drawRightString if align=='right' else self.c.drawString)(x,y,value)

    def lines(self, value, width, size=10, bold=False):
        font = self.bold if bold else self.font
        lines, line = [], ''
        for word in str(value).split():
            trial = (line+' '+word).strip()
            if line and pdfmetrics.stringWidth(trial,font,size)>width:
                lines.append(line)
                line = word
            else:
                line = trial
        return lines+[line] if line else lines

    def paragraph(self, value, x, y, width=None, size=9, color='muted', leading=14):
        for line in self.lines(value,width or self.width,size):
            self.text(x,y,line,size,color)
            y -= leading
        return y

    def gradient(self, x, y, width, height):
        colors = [self.colors[k] for k in ('blue','purple','pink','orange')]
        for i in range(math.ceil(width)):
            value = i/width*3
            j = min(int(value),2)
            a,b,f = colors[j],colors[j+1],value-j
            self.c.setFillColor(Color(a.red*(1-f)+b.red*f,a.green*(1-f)+b.green*f,a.blue*(1-f)+b.blue*f))
            self.c.rect(x+i,y,1.1,height,fill=1,stroke=0)

    def rule(self,y):
        self.c.setStrokeColor(self.colors['line'])
        self.c.setLineWidth(.6)
        self.c.line(self.m,y,self.w-self.m,y)

    def start(self, section, title, subtitle=''):
        self.pages += 1
        self.c.setFillColor(white)
        self.c.rect(0,0,self.w,self.h,fill=1,stroke=0)
        self.gradient(0,self.h-7,self.w,7)
        self.text(self.m,self.h-39,self.agency.upper(),8,'muted',True,maxwidth=230)
        self.text(self.w-self.m,self.h-39,self.client.upper(),8,'muted',align='right',maxwidth=240)
        self.text(self.m,self.h-77,section.upper(),8,'pink',True)
        title_lines = self.lines(title,self.width,24,True)
        y = self.h-108
        for line in title_lines:
            self.text(self.m,y,line,24,'ink',True,maxwidth=self.width)
            y -= 27
        if subtitle:
            y = self.paragraph(subtitle,self.m,y+5,size=9,leading=12)
        self.top = min(680,y-17)

    def finish(self):
        self.rule(46)
        footer = f'Captured {self.capture} | Instagram native insights | Template {self.theme["version"]}'
        if self.data.get('demo'):
            footer = 'TEMPLATE PREVIEW | DEMO DATA | '+footer
        self.text(self.m,29,footer,7,'muted',maxwidth=self.width-30)
        self.text(self.w-self.m,29,f'{self.pages:02d}',8,'muted',align='right')
        self.c.showPage()

    def asset(self, image):
        p = Path(image['path'])
        return p if p.is_absolute() else self.root/p

    def picture(self,image,x,y,w,h):
        self.c.setFillColor(self.colors['background'])
        self.c.rect(x,y,w,h,fill=1,stroke=0)
        if image is None:
            self.text(x+9,y+h/2,'Visual unavailable',9,'muted',maxwidth=w-18)
            return
        path = self.asset(image)
        with Image.open(path) as im:
            iw,ih = im.size
        scale = min(w/iw,h/ih)
        dw,dh = iw*scale,ih*scale
        self.c.drawImage(str(path),x+(w-dw)/2,y+(h-dh)/2,dw,dh,mask='auto')

    def link(self,x,y,url,label='Open source'):
        self.text(x,y,label,8,'purple')
        self.c.linkURL(url,(x,y-2,x+pdfmetrics.stringWidth(label,self.font,8),y+10),relative=0)

    def metric(self,x,y,label,value,size=24,width=235):
        self.text(x,y,number(value),size,'ink',True,maxwidth=width)
        self.text(x,y-18,label,9,'muted',maxwidth=width)

    def total(self,items,key):
        values = [(i['metrics'].get(key),i.get('metric_basis',{}).get(key)) for i in items]
        known = [(v,b) for v,b in values if v is not None]
        if not known:
            return None
        if len({b for _,b in known})>1 and not self.data.get('allow_mixed_native_totals',False):
            return 'Mixed bases'
        return sum(v for v,_ in known)

    def subtitle(self,item):
        parts = [dated(item['published_date'])]
        if item.get('published_at'):
            dt = datetime.fromisoformat(item['published_at'].replace('Z','+00:00')).astimezone(self.zone)
            parts.append(dt.strftime('%H:%M')+' '+self.data['window']['timezone'])
        parts.append(item['type'].capitalize())
        return ' | '.join(parts)

    def rows(self,rows,x,y,width=243):
        for n,(key,value) in enumerate(rows):
            label = key.replace('_pct',' (%)').replace('_',' ')
            label_lines = self.lines(label,width*.61-18,8)
            value_lines = self.lines(number(value),width*.36-9,9,True)
            height = max(24,max(len(label_lines),len(value_lines))*11+10)
            if n%2==0:
                self.c.setFillColor(self.colors['background'])
                self.c.rect(x,y-height+5,width,height,fill=1,stroke=0)
            for k,line in enumerate(label_lines):
                self.text(x+9,y-10-k*11,line,8,'muted')
            for k,line in enumerate(value_lines):
                self.text(x+width-9,y-10-k*11,line,9,'ink',True,align='right')
            y -= height
        return y

    def fitting_rows(self,rows,y,width=243,bottom=110):
        count=0
        for key,value in rows:
            label=key.replace('_pct',' (%)').replace('_',' ')
            height=max(24,max(len(self.lines(label,width*.61-18,8)),len(self.lines(number(value),width*.36-9,9,True)))*11+10)
            if y-height<bottom:break
            y-=height;count+=1
        return rows[:count],rows[count:]

    def detail_rows(self,item,excluded=()):
        rows = []
        for key,value in item['metrics'].items():
            if key in excluded:
                continue
            shown = f'{value:g}%' if value is not None and key.endswith('_pct') else value
            rows.append((key,shown))
        return rows

    def notes(self,item,y):
        notes = list(item.get('native_notes',[]))
        if item.get('missing_visual_note'):
            notes.append(item['missing_visual_note'])
        if item.get('promotion')=='present':
            notes.insert(0,'Promotion indicator present.')
        for note in notes:
            height = len(self.lines(note,self.width,8))*11+7
            if y-height<80:
                self.finish()
                self.start('03 / Content delivery / Notes',item.get('title') or item['id'],self.subtitle(item))
                y = self.top
            y = self.paragraph(note,self.m,y,size=8,leading=11)-7
        return y

    def details(self,item,rows,y):
        while rows:
            half=math.ceil(len(rows)/2)
            left,leftover_left=self.fitting_rows(rows[:half],y)
            right,leftover_right=self.fitting_rows(rows[half:],y,width=246)
            if not leftover_left and not leftover_right:
                remaining=[]
            else:
                left,remaining=self.fitting_rows(rows,y)
                right,remaining=self.fitting_rows(remaining,y,width=246)
            if not left and not right and y>600:
                raise ValueError('A metric label is too long for one page; shorten the label and retain its full native wording in notes')
            y1 = self.rows(left,44,y)
            y2 = self.rows(right,305,y,width=246)
            rows=remaining
            y = min(y1,y2)-22
            if rows:
                self.finish()
                self.start('03 / Content delivery / Additional metrics',item.get('title') or item['id'],self.subtitle(item))
                y = self.top
        return self.notes(item,y)

    def cover(self):
        self.start('Delivery report','Instagram',self.window+' | inclusive')
        y = 650
        for line in self.lines(self.client,self.width,31,True):
            self.text(44,y,line,31,'ink',True,maxwidth=self.width)
            y -= 36
        self.text(44,y+7,'@'+self.data['account'].lstrip('@'),13,'purple',maxwidth=self.width)
        self.gradient(44,594,self.width,3)
        selected = (self.groups['reel'] or self.items)[:4]
        if selected:
            gap=9; width=(self.width-gap*(len(selected)-1))/len(selected)
            for n,item in enumerate(selected):
                self.picture(next(iter(item.get('visuals',[])),None),44+n*(width+gap),337,width,230)
        self.text(44,302,'PUBLISHED CONTENT',8,'pink',True)
        for n,t in enumerate(TYPES):
            self.metric(44+n*130,267,NAMES[t],len(self.groups[t]),width=115)
        self.paragraph('Content delivery and recorded performance. Includes individual visuals, carousel slides and native insights.',44,202,size=11,color='ink',leading=17)
        self.paragraph(f'Publication window: {self.window}. Metrics captured {self.capture}; cumulative item insights can include activity after the publication window.',44,131)
        self.finish()

    def summary(self):
        self.start('01 / Collective insights','Delivery at a glance',f'{len(self.items)} published items | metrics for listed content')
        def summary_label(key):
            bases={i.get('metric_basis',{}).get(key) for i in self.items if i['metrics'].get(key) is not None}
            return 'Native '+key.lower()+' (mixed bases)' if len(bases)>1 and self.data.get('allow_mixed_native_totals') else 'Recorded '+key.lower()
        self.metric(44,665,summary_label('Views'),self.total(self.items,'Views'))
        self.metric(310,665,summary_label('Interactions'),self.total(self.items,'Interactions'))
        self.rule(619)
        self.text(44,593,'FORMAT',8,'muted',True)
        for x,label in [(285,'ITEMS'),(409,'VIEWS'),(551,'INTERACTIONS')]:
            self.text(x,593,label,8,'muted',True,align='right')
        for n,t in enumerate(TYPES):
            y=562-n*39
            self.text(44,y,NAMES[t],11,'ink',True)
            for x,v in [(285,len(self.groups[t])),(409,self.total(self.groups[t],'Views')),(551,self.total(self.groups[t],'Interactions'))]:
                self.text(x,y,number(v),10,align='right')
        self.rule(421)
        for n,key in enumerate(['Likes','Comments','Saves','Shares','Replies','Follows']):
            self.metric(44+(n%3)*173,378-(n//3)*77,'Content-attributed follows' if key=='Follows' else key,self.total(self.items,key),width=160)
        y=self.paragraph('Item totals are cumulative at capture unless their metric basis states otherwise. Unique reach, viewers and accounts engaged are shown per item and are not added as unique people. Content-attributed follows are not net follower growth.',44,235)
        basis={i.get('metric_basis',{}).get(k) for i in self.items for k in ['Views','Interactions'] if i['metrics'].get(k) is not None}
        if len(basis)>1:
            note='Collective figures sum mixed native definitions, as explicitly enabled for this report. See individual promotion and definition notes.' if self.data.get('allow_mixed_native_totals') else 'Different native metric definitions are present. Incompatible totals are separated on the metric-basis page.'
            y=self.paragraph(note,44,y-15)
        missing=sum(v is None for i in self.items for v in i['metrics'].values())
        if missing:
            self.paragraph(f'{missing} unavailable fields are retained as dashes. Numeric sums cover observed values only.',44,y-15)
        self.finish()
        mixed_groups=check(self.data,self.root)['metric_groups']
        if len(basis)>1 and not self.data.get('allow_mixed_native_totals'):
            self.start('01 / Collective insights / Definitions','Metric basis groups','Separate native definitions | observed values only')
            y=self.top
            for row in mixed_groups:
                height=26+len(self.lines(row['basis'],440,8))*11
                if y-height<75:
                    self.finish();self.start('01 / Collective insights / Definitions','Metric basis groups','Separate native definitions | observed values only');y=self.top
                self.text(44,y,row['metric'],10,'ink',True)
                self.text(551,y,number(row['sum']),10,'ink',True,align='right')
                y=self.paragraph(row['basis'],44,y-15,width=440,size=8,leading=11)-15
            self.finish()

    def graphs(self):
        self.start('02 / Performance graphs','Content performance','Native figures by format | '+self.window)
        for title,key,top in [('Recorded views','Views',658),('Recorded interactions','Interactions',435)]:
            self.text(44,top,title,12,'ink',True)
            values=[self.total(self.groups[t],key) for t in TYPES]
            maximum=max([v for v in values if isinstance(v,(int,float))]+[0])
            for n,(t,value,color) in enumerate(zip(TYPES,values,['purple','pink','orange','blue'])):
                y=top-36-n*37
                self.text(44,y+3,NAMES[t],10)
                self.c.setFillColor(self.colors['background']);self.c.rect(133,y,300,14,fill=1,stroke=0)
                if maximum and isinstance(value,(int,float)) and value:
                    self.c.setFillColor(self.colors[color]);self.c.rect(133,y,300*value/maximum,14,fill=1,stroke=0)
                self.text(551,y+3,number(value),10,'ink',True,align='right')
        self.text(44,217,'STORY NAVIGATION',10,'ink',True)
        self.rows([(k,self.total(self.groups['story'],k)) for k in ['Forwards','Exited','Back','Next story']],44,196,width=self.width)
        self.finish()

    def feed(self,item):
        images=item.get('visuals',[])
        chunks=[images[i:i+3] for i in range(0,len(images),3)] if item['type']=='carousel' else [images[:1]]
        chunks=chunks or [[]]
        for part,chunk in enumerate(chunks):
            self.start('03 / Content delivery',item.get('title') or item['type'].capitalize(),self.subtitle(item)+(f' | Slides {part*3+1}-{part*3+len(chunk)}' if len(chunks)>1 else ''))
            self.manifest.append({'page':self.pages,'id':item['id'],'published_date':item['published_date'],'visuals':[v['path'] for v in chunk]})
            top=min(self.top,680)
            if item['type']=='carousel':
                count=max(len(chunk),1);gap=9;width=(self.width-gap*(count-1))/count
                for n,image in enumerate(chunk):
                    self.picture(image,44+n*(width+gap),top-230,width,230)
                    self.text(44+n*(width+gap),top-244,f'Slide {part*3+n+1}',8,'muted')
                y=top-285
                for n,key in enumerate(['Views','Interactions','Follows']):
                    self.metric(44+n*174,y,key,item['metrics'].get(key),width=155)
                y-=57
            else:
                self.picture(next(iter(chunk),None),44,top-250,200,250)
                for n,key in enumerate(['Views','Interactions','Follows']):
                    self.metric(278,top-30-n*68,'Content-attributed follows' if key=='Follows' else key,item['metrics'].get(key))
                y=top-289
            if part==0:
                for n,key in enumerate(['Likes','Comments','Saves','Shares']):
                    self.text(44+n*130,y,key,8,'muted')
                    self.text(44+n*130,y-23,number(item['metrics'].get(key)),17,'ink',True)
                y-=57
                self.rule(y+5)
                rows=self.detail_rows(item,{'Views','Interactions','Follows','Likes','Comments','Saves','Shares'})
                self.details(item,rows,y-7)
            self.link(44,74,item['source_url'],'Open published content')
            self.finish()

    def story_group(self,group):
        # Dense or unusually verbose story data uses full pages rather than truncation.
        if any(len(i['metrics'])>18 or i.get('native_notes') or i.get('missing_visual_note') for i in group):
            for item in group:
                self.story_single(item)
            return
        if len(group)==1:
            self.story_single(group[0]);return
        self.start('03 / Content delivery / Stories',f'Stories {group[0]["report_label"]} - {group[-1]["report_label"]}','Archive visuals and individual insights | chronological order')
        for n,item in enumerate(group):
            y=480-n*199
            self.manifest.append({'page':self.pages,'id':item['id'],'published_date':item['published_date'],'visuals':[v['path'] for v in item.get('visuals',[])]})
            self.picture(next(iter(item.get('visuals',[])),None),44,y,101,180)
            self.text(163,y+165,item['report_label']+' | '+dated(item['published_date']),12,'ink',True)
            self.link(462,y+166,item['source_url'],'View insights')
            for k,key in enumerate(['Views','Viewers','Interactions']):
                self.metric(163+k*131,y+126,key,item['metrics'].get(key),20,120)
            other=self.detail_rows(item,{'Views','Viewers','Interactions'})
            # Compact records retain every saved field. Native labels remain readable.
            for k,(label,value) in enumerate(other):
                x=163+(k%2)*198;yy=y+86-(k//2)*12
                self.text(x,yy,label.replace('_pct',' (%)').replace('_',' ')+': '+number(value),7.5,'muted',maxwidth=190)
            if n<len(group)-1:self.rule(y-10)
        self.finish()

    def story_single(self,item):
        self.start('03 / Content delivery / Stories','Story '+item['report_label'],self.subtitle(item))
        self.manifest.append({'page':self.pages,'id':item['id'],'published_date':item['published_date'],'visuals':[v['path'] for v in item.get('visuals',[])]})
        top=min(self.top,660)
        self.picture(next(iter(item.get('visuals',[])),None),44,top-356,200,356)
        for n,key in enumerate(['Views','Viewers','Interactions']):
            self.metric(278,top-60-n*72,key,item['metrics'].get(key))
        self.details(item,self.detail_rows(item,{'Views','Viewers','Interactions'}),top-395)
        self.link(44,74,item['source_url'],'View insights')
        self.finish()

    def basis(self):
        self.start('04 / Reporting basis','Scope and metric notes','Source: @'+self.data['account'].lstrip('@'))
        notes=[('Publication window',self.window+', inclusive. '+', '.join(f'{len(self.groups[t])} {NAMES[t].lower()}' for t in TYPES)+'.'),('Capture date',f'{self.capture}. Cumulative item metrics can include activity after the publication window. Exact account-period totals are included only when their dates were independently verified.'),('Ordering and visuals','The catalogue interleaves formats by publication date. Within-day cross-format order is unspecified where story timestamps are unavailable. Carousel slides retain their sequence. Video is represented by covers or previews with source links.'),('Collective figures','Sums cover observed, compatible native values. Reach, viewers and accounts engaged are not added into unique people. Content-attributed follows are not net follower growth.'),('Unavailable fields','A dash means unavailable. Zero is used only when observed or explicitly justified in the item notes.')]
        notes += [('Coverage',str(n)) for n in self.data.get('coverage',{}).get('notes',[])]
        notes += [('Reporting note',str(n)) for n in self.data.get('report_notes',[])]
        if self.data.get('demo'):notes.insert(0,('Template preview','All sample images, account details and figures are fictional demonstration material.'))
        y=self.top
        for title,body in notes:
            height=len(self.lines(body,self.width,9))*14+40
            if y-height<75:
                self.finish();self.start('04 / Reporting basis / Continued','Scope and metric notes');y=self.top
            self.text(44,y,title,11,'ink',True)
            y=self.paragraph(body,44,y-20)-22
        self.finish()

    def render(self):
        self.cover();self.summary();self.graphs()
        pending=[];story_number=0
        for item in self.items:
            if item['type']=='story':
                story_number+=1;item['report_label']=f'S{story_number:02d}';pending.append(item)
                if len(pending)==3:self.story_group(pending);pending=[]
            else:
                if pending:self.story_group(pending);pending=[]
                self.feed(item)
        if pending:self.story_group(pending)
        self.basis();self.c.save()
        return {'template_version':self.theme['version'],'pages':self.pages,'items':len(self.items),'catalogue':self.manifest}


def main():
    parser=argparse.ArgumentParser(description=__doc__)
    parser.add_argument('dataset',type=Path)
    parser.add_argument('output',type=Path)
    parser.add_argument('--font-regular',type=Path)
    parser.add_argument('--font-bold',type=Path)
    args=parser.parse_args()
    if bool(args.font_regular)!=bool(args.font_bold):parser.error('Provide both font files together')
    data=json.loads(args.dataset.read_text())
    result=check(data,args.dataset.resolve().parent)
    if not result['ok']:
        print(json.dumps(result,indent=2));return 1
    args.output.parent.mkdir(parents=True,exist_ok=True)
    fonts=(str(args.font_regular),str(args.font_bold)) if args.font_regular else None
    manifest=Report(data,args.dataset.resolve().parent,args.output,fonts).render()
    args.output.with_suffix('.manifest.json').write_text(json.dumps(manifest,indent=2))
    print(json.dumps({'output':str(args.output),'pages':manifest['pages'],'items':manifest['items'],'template_version':manifest['template_version']}))
    return 0


if __name__=='__main__':sys.exit(main())
