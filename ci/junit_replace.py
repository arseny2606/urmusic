with open("../frontend/junit.xml", "r+", encoding="utf-8") as f:
    lines = [line.replace("<![CDATA[", "").replace("]]>", "").replace("&apos;", "'") for line in
             f.readlines()]
    f.seek(0)
    f.writelines(lines)
    f.truncate()
