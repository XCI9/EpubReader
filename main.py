# coding= utf-8
import os
import shutil       #解壓縮用(或import zipfile)
import sys
import xml.etree.ElementTree as ET
import re
import http.server
import socketserver
import socket
import urllib.parse


def createcontent(root,looptimes):
    contenttemp=[]
    for navPoint in root.findall('navPoint'):
        name = navPoint.find('navLabel').find('text').text
        link = navPoint.find('content').get('src')
        if(link.find('.xhtml') != -1):
            link = link.split('.xhtml')[0]
            link += '.html'
        contenttemp.append((name,link,looptimes))
        if(navPoint.find('navPoint') != ""):
            contenttemp += createcontent(navPoint,looptimes+1)
    return contenttemp


exit = False
while 1:
    if(len(sys.argv)>=2):
        filename = sys.argv[1].split("\\")[-1]
        path = sys.argv[1].split("\\"+filename)[0] +"\\"
        print("from: "+path+filename)
    else:
        filename = input("Please enter the book path:")
        if(filename.find("\\")!=-1):
            filename = filename.split("\\")[-1]
            path = filename.split("\\"+filename)[0] +"\\"
        else:
            path =""

    try:
        if filename.find(".") == -1:
            filename = filename + ".zip"
        extension = filename.split(".")[-1]
        if extension in ["zip","epub"]:
            os.makedirs(r'./book', exist_ok=True)
            foldername = filename.split('.'+extension)[0]
            folder = './book/'+foldername
            print('bookname: '+foldername)
            try:
                os.mkdir(folder)
            except:
                exit = True
                print("Using cache file from "+os.path.abspath(folder))
                break
            shutil.unpack_archive(path+filename,folder,"zip")
            print("Unpack finished!")
        else:
            print("Unsupport file type!")
            continue
        break
    except:
        print("Open file failed.")
        os.system("pause")

if(exit == False):
    src_path = os.path.abspath("./book/src")
    files=[]
    for root, directories, f in os.walk(folder):
        for file in f:
            if file.find(".ncx") != -1:
                contentfile=os.path.join(root, file)
            if file.find(".opf") != -1:
                linkfile=os.path.join(root, file)
            if file.find(".") != -1 and file.split(".")[1] in ['html','htm']:
                files.append(os.path.join(root, file+"..temp"))
                os.rename(files[-1].split("..temp")[0],files[-1])
            if file.find(".xhtml") != -1:
                files.append(os.path.join(root, file.split('.xhtml')[0]+".html..temp"))
                os.rename(files[-1].split(".html..temp")[0]+".xhtml",files[-1])
    for f in files:
        with open(f,"r",encoding="utf8") as input_file , open(f.split("..temp")[0],"w",encoding="utf8") as output_file:
            input = input_file.read()
    
            input_main = re.findall("((?:\n|.+?)*)<\/body>",input)[0]
            input_tail = re.findall("(<\/body>(?:\n|.+?)*)",input)[0]
    
            output = input_main + "<script src='https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js'></script>\n"
            output += '<script src="https://cdn.jsdelivr.net/npm/js-cookie@2/src/js.cookie.min.js"></script>\n'
            output +="<script src='fullscreenimg.js'></script>\n"
            output +="<script src='wheelzoom.js'></script>\n"
            output +="<link rel='stylesheet' type='text/css' href='fullscreenimg.css'/>\n"
            output += input_tail
            output = output.replace('.xhtml"','.html"')
            output_file.write(output)
    
        os.remove(f)
    filesname =files[-1].split("\\")[-1]

    shutil.copy("./book/src/fullscreenimg.css",files[-1].split("\\"+filesname)[0]+"\\fullscreenimg.css")
    shutil.copy("./book/src/fullscreenimg.js",files[-1].split("\\"+filesname)[0]+"\\fullscreenimg.js")
    shutil.copy("./book/src/wheelzoom.js",files[-1].split("\\"+filesname)[0]+"\\wheelzoom.js")
    
    with open(contentfile,"r",encoding="utf8") as input_file:
        input = input_file.read()
        input = input.replace("\n","")
        input_new = re.findall("(<navMap>.*<\/navMap>)",input)[0]
        bookname_input = re.findall("<docTitle>(.*)<\/docTitle>",input)[0]
        bookname = re.findall("<text>(.*)<\/text>",bookname_input)[0]
        root = ET.fromstring(input_new)
        content=[]
        content += createcontent(root,0)

    with open(linkfile,"r",encoding="utf8") as input_link_file:
        input_link = input_link_file.read()
        input_link = input_link.replace("\n","")
    
        html_file = re.findall('(<spine.*>.*<\/spine>)',input_link)[0]
        html_order_filename = []
        root1 = ET.fromstring(html_file)
        for link in root1.findall('itemref'):
            html_order_filename.append(link.get('idref'))
    
        css_file = re.findall('(<manifest.*>.*<\/manifest>)',input_link)[0]
        root = ET.fromstring(css_file)
        css_link = []
        html_order = []
        for link in root.findall('item'):
            media_type = link.get('media-type')
            if(media_type == 'text/css'):
                css_link.append(link.get('href'))
        for filename in html_order_filename:
            for item in root.findall('item'):
                if filename == item.get('id'):
                    html_order.append(item.get('href'))
                    break
    
    header='<html>\n\
    <head>\n\
    \t<!--<script src="https://cdnjs.cloudflare.com/ajax/libs/jquery/2.1.3/jquery.min.js"></script>-->\n\
    \t<script src="https://cdn.jsdelivr.net/npm/js-cookie@2/src/js.cookie.min.js" defer></script>\n\
    \t<script src="epub.js" defer></script>\
    \t<meta content="text/html;charset=utf-8" http-equiv="Content-Type">\n\
    \t<meta content="utf-8" http-equiv="encoding">\n\
    \t<meta name="viewport" content="width=device-width, initial-scale=1.0">'
    css=""
    for temp in css_link:
        css += '\t<link href="'+temp+'" rel="stylesheet" type="text/css"/>\n'
    css +='\t<link href="epub.css" rel="stylesheet" type="text/css"/>\n'
    header += css+"\n"
    header += "\t<title>" + bookname +"</title>\n</head>\n"
    
    body='<body onload="init()">\n\
    \t<div id="SidebarTrigger" onclick="showSidebar()">☰</div>\n\
    \t<sidebar onmouseleave="hideSidebar()">\n'
    bookname ="\t\t<bookname>" + bookname + "</bookname>\n"
    src_link="\t\t<content>\n"
    for temp in range(len(content)):
        if(temp != len(content)-1 and content[temp+1][2] > content[temp][2]):
            for temp1 in range(content[temp][2]):
                src_link += '\t'
            src_link += "\t\t\t<content>\n"
            for temp1 in range(content[temp][2]):
                src_link += '\t'
            src_link +='\t\t\t\t<div>'
            src_link += '<a href="javascript:changeSrc(\''+content[temp][1]+'\');" style="margin-left:'+ str(content[temp][2])+'em">'+content[temp][0]+'</a>'
            src_link += "<button>–</button></div>\n"
        else:
            for temp1 in range(content[temp][2]):
                src_link += '\t'
            src_link += '\t\t\t<a href="javascript:changeSrc(\''+content[temp][1]+'\');" style="margin-left:'+ str(content[temp][2])+'em">'+content[temp][0]+'</a>\n'
        if(temp != len(content)-1 and content[temp+1][2] < content[temp][2]):
            for temp1 in range(content[temp][2]-content[temp+1][2],0,-1):
                for temp2 in range(temp1):
                    src_link +="\t"
                src_link +="\t\t\t</content>\n"
        elif(temp+1 == len(content) and content[temp][2]!=0):
            for temp1 in range(content[temp][2],0,-1):
                for temp2 in range(temp1):
                    src_link +="\t"
                src_link += "\t\t\t</content>"
    
    
    src_link+="\t\t</content>\n\t</sidebar>\n"
    
    iframename, iframelink = content[0][0],content[0][1]
    iframe = '\t<div id="main">\n\
    \t\t<iframe onload="iframe_init()" id="ebook" src="'+iframelink+'" width="100%" height="100%" frameborder="0"></iframe>\n\t</div>\n\
    \t</div>\n'

    with open("./book/src/index_part.txt","r",encoding = "utf8") as index_part:
        index_part_content = index_part.read()

    body += bookname + src_link + iframe +  index_part_content+ '\n</body>\n</html>'
    
    with open("index.html","w",encoding="utf8") as output_file:
        output_file.write(header+body)
    contentfilename = contentfile.split("\\")[-1]
    with open("./book/src/epub.js","r",encoding="utf8") as input, open(contentfile.split("\\"+contentfilename)[0]+"\\epub.js","w",encoding="utf8") as output:
        input_str = input.read()
        append_html_order = "var file = ['"+ html_order[0].replace("xhtml","html") +"'"
        for i in range(1,len(html_order)):
            append_html_order += ",\n\t\t\t'" + html_order[i].replace("xhtml","html") + "'"
        append_html_order += "];\n"
        output.write(append_html_order + input_str)
    
    shutil.copy("./book/src/epub.css",contentfile.split("\\"+contentfilename)[0]+"\\epub.css")
    shutil.move("./" + "index.html",contentfile.split("\\"+contentfilename)[0]+"\\" + "index.html")
    finalfile = contentfile.split("\\"+contentfilename)[0].split("./")[1]+'\\' + 'index.html'

os.chdir(os.path.abspath('./book'))

PORT = 8000
s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
s.connect(("8.8.8.8", 80))
local_ip = s.getsockname()[0]
s.close()

foldername_url = urllib.parse.quote(foldername)
os.system('start http://'+local_ip+":"+str(PORT)+"/"+foldername_url+'/OEBPS"')

class NoCacheHTTPRequestHandler(
    http.server.SimpleHTTPRequestHandler
):
    def send_response_only(self, code, message=None):
        super().send_response_only(code, message)
        self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
        self.send_header("Pragma", "no-cache")
        self.send_header('Expires', '0')

with socketserver.TCPServer((local_ip, PORT), NoCacheHTTPRequestHandler) as httpd:
    print("serving at port http:\\\\"+str(local_ip)+":"+str(PORT))
    httpd.serve_forever()
