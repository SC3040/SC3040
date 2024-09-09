FROM python:3.9-slim

WORKDIR /app

RUN pip install flask==2.0.1
RUN pip install flask-cors==3.0.10
RUN pip install Werkzeug==2.0.1
RUN pip install google-api-python-client==2.143.0
RUN pip install google-generativeai==0.7.2
RUN pip install Pillow==10.4.0
RUN pip install python-dateutil==2.9.0
RUN pip install price-parser==0.3.4

ENV PYTHONUNBUFFERED=1

COPY . .

RUN mkdir -p /app/downloads

EXPOSE 8081

CMD ["python", "receiptservice.py"]